"use client"

import { GroupCard } from "@/components/lemipay/v0/group-card"
import { FundRoundProgress } from "@/components/lemipay/v0/fund-round-progress"
import { ProposalList } from "@/components/lemipay/v0/proposal-item"
import { MembersPanel } from "@/components/lemipay/v0/members-panel"
import { StatCards } from "@/components/lemipay/v0/stat-cards"
import type { Group, FundRound, ReleaseProposal } from "@/lib/stellar-client"
import { ArrowLeft } from "lucide-react"

export interface GroupDashboardContentProps {
  group: Group | null
  fundRounds: FundRound[]
  proposals: ReleaseProposal[]
  totalBalance: bigint
  isLoading: boolean
  address: string
  onBack: () => void
  onContribute: (roundIndex: number, amount: bigint) => Promise<void>
  onApproveProposal: (proposalId: bigint) => Promise<void>
  onExecuteRelease: (proposalId: bigint) => Promise<void>
  isSubmitting: boolean
}

export function GroupDashboardContent({
  group,
  fundRounds,
  proposals,
  totalBalance,
  isLoading,
  address,
  onBack,
  onContribute,
  onApproveProposal,
  onExecuteRelease,
  isSubmitting,
}: GroupDashboardContentProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis grupos
      </button>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <GroupCard
            group={group}
            totalBalance={totalBalance}
            isLoading={isLoading}
          />
          <div className="flex flex-col gap-4">
            <StatCards
              fundRounds={fundRounds}
              proposals={proposals}
              isLoading={isLoading}
            />
            <MembersPanel
              group={group}
              isLoading={isLoading}
              currentAddress={address}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FundRoundProgress
            rounds={fundRounds}
            isLoading={isLoading}
            onContribute={onContribute}
            isSubmitting={isSubmitting}
          />
          <ProposalList
            proposals={proposals}
            group={group}
            isLoading={isLoading}
            onApprove={onApproveProposal}
            onExecute={onExecuteRelease}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </main>
  )
}
