"use client"

import { useState, useCallback, useEffect } from "react"
import type {
  Group,
  FundRound,
  ReleaseProposal,
} from "@/lib/stellar-client"

// ─── Mock data (simulates Soroban contract reads) ───────────────

const MOCK_GROUP: Group = {
  id: BigInt(1),
  approvalsRequired: 2,
  members: [
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
    "GCFONE23AB7Y6C5YZOMKUKGETPIAJA752AHTQLNM7CVDXWG7NKBXSX5N",
    "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3XCDKCP5HC6V",
  ],
}

const MOCK_FUND_ROUNDS: FundRound[] = [
  {
    id: BigInt(1),
    groupId: BigInt(1),
    totalAmount: BigInt(50_000_000_0), // 500 USDC
    fundedAmount: BigInt(32_500_000_0), // 325 USDC
    completed: false,
  },
  {
    id: BigInt(2),
    groupId: BigInt(1),
    totalAmount: BigInt(10_000_000_0), // 100 USDC
    fundedAmount: BigInt(10_000_000_0), // 100 USDC
    completed: true,
  },
  {
    id: BigInt(3),
    groupId: BigInt(1),
    totalAmount: BigInt(20_000_000_0), // 200 USDC
    fundedAmount: BigInt(8_000_000_0), // 80 USDC
    completed: false,
  },
]

const MOCK_PROPOSALS: ReleaseProposal[] = [
  {
    id: BigInt(1),
    amount: BigInt(5_000_000_0), // 50 XLM
    approvals: 1,
    destination: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3XCDKCP5HC6V",
    executed: false,
  },
  {
    id: BigInt(2),
    amount: BigInt(12_000_000_0), // 120 XLM
    approvals: 2,
    destination: "GCFONE23AB7Y6C5YZOMKUKGETPIAJA752AHTQLNM7CVDXWG7NKBXSX5N",
    executed: false,
  },
  {
    id: BigInt(3),
    amount: BigInt(3_000_000_0), // 30 XLM
    approvals: 2,
    destination: "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
    executed: true,
  },
]

// ─── Hook ───────────────────────────────────────────────────────

interface UseLemipayReturn {
  group: Group | null
  fundRounds: FundRound[]
  proposals: ReleaseProposal[]
  isLoading: boolean
  error: string | null
  totalBalance: bigint
  contribute: (roundIndex: number, amount: bigint) => Promise<void>
  approveProposal: (proposalId: bigint) => Promise<void>
  executeRelease: (proposalId: bigint) => Promise<void>
  isSubmitting: boolean
}

export function useLemipay(userAddress: string | null): UseLemipayReturn {
  const [group, setGroup] = useState<Group | null>(null)
  const [fundRounds, setFundRounds] = useState<FundRound[]>([])
  const [proposals, setProposals] = useState<ReleaseProposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate total balance from all funded amounts
  const totalBalance = fundRounds.reduce(
    (acc, r) => acc + r.fundedAmount,
    BigInt(0)
  )

  // Simulate loading data from Soroban contracts
  useEffect(() => {
    if (!userAddress) {
      setGroup(null)
      setFundRounds([])
      setProposals([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const timer = setTimeout(() => {
      try {
        setGroup(MOCK_GROUP)
        setFundRounds(MOCK_FUND_ROUNDS)
        setProposals(MOCK_PROPOSALS)
      } catch {
        setError("Error al cargar los datos del contrato")
      } finally {
        setIsLoading(false)
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [userAddress])

  // Contribute to a fund round
  const contribute = useCallback(
    async (roundIndex: number, amount: bigint) => {
      setIsSubmitting(true)
      // Simulate Soroban transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setFundRounds((prev) =>
        prev.map((r, i) => {
          if (i !== roundIndex) return r
          const newFunded = r.fundedAmount + amount
          return {
            ...r,
            fundedAmount: newFunded > r.totalAmount ? r.totalAmount : newFunded,
            completed: newFunded >= r.totalAmount,
          }
        })
      )
      setIsSubmitting(false)
    },
    []
  )

  // Approve a release proposal
  const approveProposal = useCallback(async (proposalId: bigint) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, approvals: p.approvals + 1 } : p
      )
    )
    setIsSubmitting(false)
  }, [])

  // Execute a release proposal
  const executeRelease = useCallback(async (proposalId: bigint) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, executed: true } : p
      )
    )
    setIsSubmitting(false)
  }, [])

  return {
    group,
    fundRounds,
    proposals,
    isLoading,
    error,
    totalBalance,
    contribute,
    approveProposal,
    executeRelease,
    isSubmitting,
  }
}
