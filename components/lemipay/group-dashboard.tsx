"use client"

import { useLemipay } from "@/hooks/use-lemipay"
import { GroupDashboardContent } from "@/components/lemipay/group-dashboard-content"

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
    <GroupDashboardContent
      group={group}
      fundRounds={fundRounds}
      proposals={proposals}
      totalBalance={totalBalance}
      isLoading={isLoading}
      address={address}
      onBack={onBack}
      onContribute={contribute}
      onApproveProposal={approveProposal}
      onExecuteRelease={executeRelease}
      isSubmitting={isSubmitting}
    />
  )
}
