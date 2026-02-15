import { rpc } from "@stellar/stellar-sdk"

// Stellar / Soroban client configuration
// Uses Stellar Testnet with Soroban smart contracts

export const STELLAR_CONFIG = {
  networkPassphrase: "Test SDF Network ; September 2015",
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanUrl: "https://soroban-testnet.stellar.org",
  contracts: {
    groups: "CABYTW7GMOYRDOEYUTFQOFTYGPEFUZOOGYDIJLSYLDP7XFWQ4A2TFXP2",
    treasury: "CCCRRA4DSWP6UAJTF5XNK7VLD3TASQA3D274WBN5F3RDXLNI4DHJM7IZ",
  },
} as const

/** Contract ID for create_group. Override with NEXT_PUBLIC_CREATE_GROUP_CONTRACT_ID. */
export const CREATE_GROUP_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CREATE_GROUP_CONTRACT_ID ?? STELLAR_CONFIG.contracts.groups

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

// ─── Types ──────────────────────────────────────────────────────

export interface Group {
  id: bigint
  approvalsRequired: number
  members: string[]
}

export interface FundRound {
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
