"use client"

import { useState, useCallback, useEffect } from "react"
import type {
  Group,
  FundRound,
  ReleaseProposal,
} from "@/lib/stellar-client"

// Nueva interfaz para los aportes por miembro
export interface MemberContribution {
  address: string;
  name?: string;
  totalAmount: bigint;
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
  memberContributions: MemberContribution[] // Nueva data expuesta
  isLoading: boolean
  error: string | null
  totalBalance: bigint
  contribute: (roundIndex: number, amount: bigint) => Promise<void>
  approveProposal: (proposalId: bigint) => Promise<void>
  executeRelease: (proposalId: bigint) => Promise<void>
  isSubmitting: boolean
}

// Mapeo de nombres para los mocks (en producción esto vendría de un perfil)
const ADDRESS_TO_NAME: Record<string, string> = {
  "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI": "Santiago M.",
  "GCFONE23AB7Y6C5YZOMKUKGETPIAJA752AHTQLNM7CVDXWG7NKBXSX5N": "María L.",
  "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3XCDKCP5HC6V": "Carlos R.",
}

export function useLemipay(userAddress: string | null): UseLemipayReturn {
  const [group, setGroup] = useState<Group | null>(null)
  const [fundRounds, setFundRounds] = useState<FundRound[]>([])
  const [proposals, setProposals] = useState<ReleaseProposal[]>([])
  const [memberContributions, setMemberContributions] = useState<MemberContribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalBalance = fundRounds.reduce(
      (acc, r) => acc + r.fundedAmount,
      BigInt(0)
  )

  useEffect(() => {
    if (!userAddress) {
      setGroup(null)
      setFundRounds([])
      setProposals([])
      setMemberContributions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        // En una implementación real, aquí llamarías a:
        // 1. const groupData = await contract.get_group(groupId);
        // 2. const roundsIds = await contract.get_group_rounds(groupId);

        // Simulación de carga
        await new Promise(resolve => setTimeout(resolve, 1200));

        const mockGroup = {
          id: BigInt(1),
          approvalsRequired: 2,
          members: [
            "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
            "GCFONE23AB7Y6C5YZOMKUKGETPIAJA752AHTQLNM7CVDXWG7NKBXSX5N",
            "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3XCDKCP5HC6V",
          ],
        };

        // Simulación de la lógica 'get_user_contribution'
        // Para cada miembro, sumamos lo aportado en todas las rondas
        const contributions = mockGroup.members.map(member => {
          // Aquí harías un loop por cada roundId llamando a get_user_contribution(roundId, member)
          const totalMock = BigInt(Math.floor(Math.random() * 5000) * 10000000);
          return {
            address: member,
            name: ADDRESS_TO_NAME[member] || "Miembro",
            totalAmount: totalMock
          };
        });

        setGroup(mockGroup);
        setFundRounds([
          { groupId: BigInt(1), totalAmount: BigInt(500000000), fundedAmount: BigInt(325000000), completed: false },
          { groupId: BigInt(1), totalAmount: BigInt(100000000), fundedAmount: BigInt(100000000), completed: true }
        ]);
        setProposals([
          { id: BigInt(1), amount: BigInt(50000000), approvals: 1, destination: "GDQP...HC6V", executed: false }
        ]);
        setMemberContributions(contributions);

      } catch (e) {
        setError("Error al sincronizar con Stellar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
    memberContributions,
    isLoading,
    error,
    totalBalance,
    contribute,
    approveProposal,
    executeRelease,
    isSubmitting,
  }
}