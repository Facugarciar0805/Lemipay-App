"use client"

import { useCallback } from "react"
import { useLemipay } from "@/hooks/use-lemipay"
import { GroupDashboardContent } from "@/components/lemipay/group-dashboard-content"

const USDC_DECIMALS = 10_000_000

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

  const onApproveTokens = useCallback(async () => {}, [])

  const onContribute = useCallback(
    async (roundId: bigint, amountUsdc: number) => {
      const idx = fundRounds.findIndex((r) => r.id === roundId)
      if (idx < 0) return
      const amountRaw = BigInt(Math.round(amountUsdc * USDC_DECIMALS))
      await contribute(idx, amountRaw)
    },
    [fundRounds, contribute]
  )

  return (
    <GroupDashboardContent
      group={group}
      fundRounds={fundRounds}
      proposals={proposals}
      totalBalance={totalBalance}
      isLoading={isLoading}
      address={address}
      onBack={onBack}
      onApproveTokens={onApproveTokens}
      onContribute={onContribute}
      onApproveProposal={approveProposal}
      onExecuteRelease={executeRelease}
      isSubmitting={isSubmitting}
      isContributing={isSubmitting}
    />
  )
}
