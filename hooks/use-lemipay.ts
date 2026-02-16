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

  // ... (funciones contribute, approveProposal, executeRelease se mantienen igual)

  return {
    group,
    fundRounds,
    proposals,
    memberContributions,
    isLoading,
    error,
    totalBalance,
    contribute: async (idx, amt) => { /* lógica existente */ },
    approveProposal: async (id) => { /* lógica existente */ },
    executeRelease: async (id) => { /* lógica existente */ },
    isSubmitting,
  }
}