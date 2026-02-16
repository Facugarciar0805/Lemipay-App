import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  rpc,
} from "@stellar/stellar-sdk"
import type { Account } from "@stellar/stellar-sdk"
import {
  getSorobanServer,
  CREATE_GROUP_CONTRACT_ID,
  STELLAR_CONFIG,
  checkTreasuryExists,
  getGroupFundRounds,
} from "@/lib/stellar-client"
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants"
import { verifySessionToken } from "@/lib/auth/jwt"
import { GroupPageView } from "@/components/dashboard/group-page-view"
import type { Group, FundRound } from "@/lib/stellar-client"

export interface SorobanGroup {
  members: string[]
  approvals_required: number
}

function parseGroupId(id: string | undefined): bigint | null {
  if (id == null || id === undefined) return null
  const n = String(id).trim()
  if (!n || n.startsWith("-")) return null
  try {
    const big = BigInt(n)
    if (big < 0) return null
    return big
  } catch {
    return null
  }
}

async function fetchGroup(
  groupId: bigint,
  sourceAddress: string
): Promise<SorobanGroup | null> {
  const server = getSorobanServer()
  let account: Account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return null
  }
  const contract = new Contract(CREATE_GROUP_CONTRACT_ID)
  const invokeOp = contract.call(
    "get_group",
    nativeToScVal(groupId, { type: "u64" })
  )
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  })
    .addOperation(invokeOp)
    .setTimeout(60)
  const rawTx = builder.build()
  let simulation: rpc.Api.SimulateTransactionResponse
  try {
    simulation = await server.simulateTransaction(rawTx)
  } catch {
    return null
  }
  if (rpc.Api.isSimulationError(simulation)) return null
  const result = simulation.result
  if (!result?.retval) return null
  try {
    const decoded = scValToNative(result.retval) as SorobanGroup
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !Array.isArray(decoded.members) ||
      typeof decoded.approvals_required !== "number"
    ) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

function toGroup(id: bigint, g: SorobanGroup): Group {
  return {
    id,
    members: g.members,
    approvalsRequired: g.approvals_required,
  }
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = await params
  const id = resolved?.id
  const groupId = parseGroupId(id)

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!sessionToken) redirect("/")
  const session = await verifySessionToken(sessionToken)
  if (!session?.publicKey) redirect("/")
  const publicKey = session.publicKey

  if (groupId === null) {
    return (
      <GroupPageView
        publicKey={publicKey}
        groupId={id ?? ""}
        group={null}
        hasTreasury={false}
        fundRounds={[]}
        status="invalid_id"
      />
    )
  }

  const sorobanGroup = await fetchGroup(groupId, publicKey)
  if (!sorobanGroup) {
    return (
      <GroupPageView
        publicKey={publicKey}
        groupId={String(groupId)}
        group={null}
        hasTreasury={false}
        fundRounds={[]}
        status="not_found"
      />
    )
  }

  const group: Group = toGroup(groupId, sorobanGroup)
  const hasTreasury = await checkTreasuryExists(groupId, publicKey)
  const fundRounds: FundRound[] = hasTreasury
    ? await getGroupFundRounds(groupId, publicKey)
    : []

  return (
    <GroupPageView
      publicKey={publicKey}
      groupId={String(groupId)}
      group={group}
      hasTreasury={hasTreasury}
      fundRounds={fundRounds}
      status="ok"
    />
  )
}
