import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  Address,
} from "@stellar/stellar-sdk"

// Stellar / Soroban client configuration
// Uses Stellar Testnet with Soroban smart contracts

export const STELLAR_CONFIG = {
  networkPassphrase: "Test SDF Network ; September 2015",
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanUrl: "https://soroban-testnet.stellar.org",
  contracts: {
    groups: "CABYTW7GMOYRDOEYUTFQOFTYGPEFUZOOGYDIJLSYLDP7XFWQ4A2TFXP2",
    treasury: "CCCRRA4DSWP6UAJTF5XNK7VLD3TASQA3D274WBN5F3RDXLNI4DHJM7IZ",
    /** USDC token (testnet). Override with NEXT_PUBLIC_USDC_CONTRACT_ID if different. */
    usdc: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  },
} as const

/** Contract ID for create_group. Override with NEXT_PUBLIC_CREATE_GROUP_CONTRACT_ID. */
export const CREATE_GROUP_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CREATE_GROUP_CONTRACT_ID ?? STELLAR_CONFIG.contracts.groups

/** Treasury contract ID. Override with NEXT_PUBLIC_CREATE_TREASURY_CONTRACT_ID. */
export const TREASURY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CREATE_TREASURY_CONTRACT_ID ?? STELLAR_CONFIG.contracts.treasury

/** USDC token contract ID. Override with NEXT_PUBLIC_USDC_CONTRACT_ID. */
export const USDC_CONTRACT_ID =
  process.env.NEXT_PUBLIC_USDC_CONTRACT_ID ?? STELLAR_CONFIG.contracts.usdc

let sorobanServerInstance: rpc.Server | null = null

/** Returns a Soroban RPC Server instance (singleton). */
export function getSorobanServer(options?: rpc.Server.Options): rpc.Server {
  if (!sorobanServerInstance) {
    sorobanServerInstance = new rpc.Server(STELLAR_CONFIG.sorobanUrl, {
      allowHttp: false,
      timeout: 30_000,
      ...options,
    })
  }
  return sorobanServerInstance
}

// ─── Utility: Stroops <-> XLM ───────────────────────────────────
// 1 XLM = 10_000_000 stroops (7 decimals)
const STROOPS_PER_XLM = BigInt(10_000_000)

export function stroopsToXlm(stroops: bigint): number {
  const wholePart = stroops / STROOPS_PER_XLM
  const fractionalPart = stroops % STROOPS_PER_XLM
  return Number(wholePart) + Number(fractionalPart) / Number(STROOPS_PER_XLM)
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * Number(STROOPS_PER_XLM)))
}

export function formatXlm(stroops: bigint, decimals = 2): string {
  return stroopsToXlm(stroops).toFixed(decimals)
}

export function formatXlmFromNumber(amount: number, decimals = 2): string {
  return amount.toFixed(decimals)
}

// ─── USDC (7 decimals on Stellar: 1 USDC = 10_000_000 units) ──────
export const USDC_DECIMALS = 10_000_000

export function formatUsdc(amountRaw: bigint, decimals = 2): string {
  const whole = amountRaw / BigInt(USDC_DECIMALS)
  const frac = amountRaw % BigInt(USDC_DECIMALS)
  const num = Number(whole) + Number(frac) / USDC_DECIMALS
  return num.toFixed(decimals)
}

// ─── Treasury contract (read-only) ────────────────────────────────

/**
 * Checks if a treasury exists for the given group (calls check_treasury_id on Treasury contract).
 */
export async function checkTreasuryExists(
  groupId: bigint,
  sourceAddress: string
): Promise<boolean> {
  const server = getSorobanServer()
  let account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return false
  }
  const contract = new Contract(TREASURY_CONTRACT_ID)
  const invokeOp = contract.call(
    "check_treasury_id",
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
    return false
  }
  if (rpc.Api.isSimulationError(simulation)) return false
  const result = simulation.result
  if (!result?.retval) return false
  try {
    const decoded = scValToNative(result.retval) as boolean
    return decoded === true
  } catch {
    return false
  }
}

/** Raw FundRound struct as returned by the Treasury contract. */
export interface ContractFundRound {
  amount_of_members: number
  completed: boolean
  funded_amount: bigint
  group_id: bigint
  total_amount: bigint
}

/**
 * Returns the list of fund round IDs for a group (calls get_group_rounds on Treasury contract).
 */
export async function getGroupRounds(
  groupId: bigint,
  sourceAddress: string
): Promise<bigint[]> {
  const server = getSorobanServer()
  let account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return []
  }
  const contract = new Contract(TREASURY_CONTRACT_ID)
  const invokeOp = contract.call(
    "get_group_rounds",
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
    return []
  }
  if (rpc.Api.isSimulationError(simulation)) return []
  const result = simulation.result
  if (!result?.retval) return []
  try {
    const decoded = scValToNative(result.retval) as bigint[]
    return Array.isArray(decoded) ? decoded : []
  } catch {
    return []
  }
}

/**
 * Returns a single fund round by ID (calls get_fund_round on Treasury contract).
 */
export async function getFundRound(
  roundId: bigint,
  sourceAddress: string
): Promise<ContractFundRound | null> {
  const server = getSorobanServer()
  let account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return null
  }
  const contract = new Contract(TREASURY_CONTRACT_ID)
  const invokeOp = contract.call(
    "get_fund_round",
    nativeToScVal(roundId, { type: "u64" })
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
    const decoded = scValToNative(result.retval) as ContractFundRound
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.completed !== "boolean"
    ) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

/**
 * Fetches all fund rounds for a group (get_group_rounds + get_fund_round for each).
 */
export async function getGroupFundRounds(
  groupId: bigint,
  sourceAddress: string
): Promise<FundRound[]> {
  const roundIds = await getGroupRounds(groupId, sourceAddress)
  if (roundIds.length === 0) return []

  const rounds: FundRound[] = []
  for (const id of roundIds) {
    const raw = await getFundRound(id, sourceAddress)
    if (!raw) continue
    rounds.push({
      id,
      groupId: raw.group_id,
      totalAmount: raw.total_amount,
      fundedAmount: raw.funded_amount,
      completed: raw.completed,
    })
  }
  return rounds
}

/**
 * Returns a user's contribution to a fund round (calls get_user_contribution on Treasury contract).
 */
export async function getUserContribution(
  roundId: bigint,
  userAddress: string,
  sourceAddress: string
): Promise<bigint> {
  const server = getSorobanServer()
  let account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return BigInt(0)
  }
  const contract = new Contract(TREASURY_CONTRACT_ID)
  const invokeOp = contract.call(
    "get_user_contribution",
    nativeToScVal(roundId, { type: "u64" }),
    nativeToScVal(Address.fromString(userAddress))
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
    return BigInt(0)
  }
  if (rpc.Api.isSimulationError(simulation)) return BigInt(0)
  const result = simulation.result
  if (!result?.retval) return BigInt(0)
  try {
    const decoded = scValToNative(result.retval) as bigint
    return typeof decoded === "bigint" ? decoded : BigInt(0)
  } catch {
    return BigInt(0)
  }
}

/**
 * Raw ReleaseProposal struct from the contract (get_release_proposal).
 * Contract: amount (i128), approvals (u32), destination (address), executed (bool), group_id (u64)
 */
/** Contract returns struct as map; i128 amount can come as string (e.g. "20" or "200000000"). */
interface ContractReleaseProposalStruct {
  amount?: bigint | number | string
  approvals?: number
  destination?: string | { address?: string }
  executed?: boolean
  group_id?: bigint | number
}

/**
 * Returns a single release proposal by ID (calls get_release_proposal on Treasury contract).
 * The contract struct does not include id; we pass it through.
 */
export async function getReleaseProposal(
  proposalId: bigint,
  sourceAddress: string
): Promise<ReleaseProposal | null> {
  const server = getSorobanServer()
  let account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return null
  }
  const contract = new Contract(TREASURY_CONTRACT_ID)
  const invokeOp = contract.call(
    "get_release_proposal",
    nativeToScVal(proposalId, { type: "u64" })
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
    const raw = scValToNative(result.retval) as ContractReleaseProposalStruct
    if (!raw || typeof raw !== "object") return null
    // i128 amount can be bigint, number, or string from SDK; use String to avoid precision loss
    const amount =
      typeof raw.amount === "bigint"
        ? raw.amount
        : BigInt(String(raw.amount ?? 0))
    const approvals = typeof raw.approvals === "number" ? raw.approvals : 0
    let destination = ""
    const dest = raw.destination
    if (typeof dest === "string") {
      destination = dest
    } else if (dest && typeof dest === "object" && "address" in dest) {
      destination = String((dest as { address?: string }).address ?? "")
    }
    const executed = Boolean(raw.executed)
    return {
      id: proposalId,
      amount,
      approvals,
      destination,
      executed,
    }
  } catch {
    return null
  }
}

/**
 * Returns the release proposals for a group.
 * get_release_proposals_of_group returns vec<u64> (IDs); we fetch each with get_release_proposal.
 */
export async function getReleaseProposalsOfGroup(
  groupId: bigint,
  sourceAddress: string
): Promise<ReleaseProposal[]> {
  const server = getSorobanServer()
  let account
  try {
    account = await server.getAccount(sourceAddress)
  } catch {
    return []
  }
  const contract = new Contract(TREASURY_CONTRACT_ID)
  const invokeOp = contract.call(
    "get_release_proposals_of_group",
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
    return []
  }
  if (rpc.Api.isSimulationError(simulation)) return []
  const result = simulation.result
  if (!result?.retval) return []
  let proposalIds: bigint[] = []
  try {
    const decoded = scValToNative(result.retval) as unknown
    if (Array.isArray(decoded)) {
      proposalIds = decoded.map((v) => BigInt(v))
    }
  } catch {
    return []
  }
  const proposals: ReleaseProposal[] = []
  for (const id of proposalIds) {
    const p = await getReleaseProposal(id, sourceAddress)
    if (p) proposals.push(p)
  }
  return proposals
}

/** Per-member contribution and balance for the contributions panel. */
export interface MemberContributionInfo {
  address: string
  /** Display name from wallet_profiles (optional). */
  name?: string
  totalAmount: bigint
  /** Balance in USDC (display): positive = a favor, negative = debe aportar. */
  balance: number
}

/**
 * Fetches each member's total contribution across all rounds and computes balance (fair share - contribution).
 */
export async function getGroupMemberContributions(
  groupId: bigint,
  sourceAddress: string,
  members: string[],
  roundIds: bigint[]
): Promise<MemberContributionInfo[]> {
  const contributions: { address: string; totalAmount: bigint }[] = []

  for (const address of members) {
    let total = BigInt(0)
    for (const roundId of roundIds) {
      const amount = await getUserContribution(roundId, address, sourceAddress)
      total += amount
    }
    contributions.push({ address, totalAmount: total })
  }

  const totalContributed = contributions.reduce((acc, c) => acc + c.totalAmount, BigInt(0))
  const memberCount = members.length
  const fairShareRaw =
    memberCount > 0 ? totalContributed / BigInt(memberCount) : BigInt(0)

  return contributions.map((c) => {
    const balanceRaw = c.totalAmount - fairShareRaw
    const balanceDisplay = Number(balanceRaw) / USDC_DECIMALS
    return {
      address: c.address,
      totalAmount: c.totalAmount,
      balance: balanceDisplay,
    }
  })
}

// ─── Types ──────────────────────────────────────────────────────

export interface Group {
  id: bigint
  approvalsRequired: number
  members: string[]
}

export interface FundRound {
  id: bigint
  groupId: bigint
  totalAmount: bigint
  fundedAmount: bigint
  completed: boolean
}

export interface ReleaseProposal {
  id: bigint
  amount: bigint
  approvals: number
  destination: string
  executed: boolean
}

export interface UserContribution {
  address: string
  amount: bigint
}
