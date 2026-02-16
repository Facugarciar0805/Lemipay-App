import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
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
