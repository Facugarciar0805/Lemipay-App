"use client"

import { useLemipay } from "@/hooks/use-lemipay"
import { GroupCard } from "@/components/lemipay/v0/group-card"
import { FundRoundProgress } from "@/components/lemipay/v0/fund-round-progress"
import { ProposalList } from "@/components/lemipay/v0/proposal-item"
import { MembersPanel } from "@/components/lemipay/v0/members-panel"
import { StatCards } from "@/components/lemipay/v0/stat-cards"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface GroupDashboardProps {
    address: string
    onBack: () => void
}

export function GroupDashboard({ address, onBack }: GroupDashboardProps) {
    const {
        group,
        fundRounds,
        proposals,
        isLoading,
        totalBalance,
        contribute,
        approveProposal,
        executeRelease,
        isSubmitting,
    } = useLemipay(address)

    return (
        <main className="mx-auto max-w-5xl px-4 py-6">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a mis grupos
            </button>

            <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <GroupCard group={group} totalBalance={totalBalance} isLoading={isLoading} />
                    <div className="flex flex-col gap-4">
                        <StatCards fundRounds={fundRounds} proposals={proposals} isLoading={isLoading} />
                        <MembersPanel group={group} isLoading={isLoading} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FundRoundProgress
                        rounds={fundRounds}
                        isLoading={isLoading}
                        onContribute={contribute}
                        isSubmitting={isSubmitting}
                    />
                    <ProposalList
                        proposals={proposals}
                        group={group}
                        isLoading={isLoading}
                        onApprove={approveProposal}
                        onExecute={executeRelease}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </main>
    )
}