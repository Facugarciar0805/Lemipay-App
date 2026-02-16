"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"
import { GroupDashboardContent } from "@/components/lemipay/group-dashboard-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Footer from "@/components/landing/Footer"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Group, FundRound, MemberContributionInfo } from "@/lib/stellar-client"
import { useCreateTreasury } from "@/hooks/useCreateTreasury"
import { useProposeFundRound } from "@/hooks/useProposeFundRound"
import { useContributeToFundRound } from "@/hooks/useContributeToFundRound"

export type GroupPageStatus = "ok" | "invalid_id" | "not_found"

export interface GroupPageViewProps {
  publicKey: string
  groupId: string
  group: Group | null
  hasTreasury: boolean
  fundRounds: FundRound[]
  totalBalance: bigint
  memberContributions: MemberContributionInfo[]
  status: GroupPageStatus
}

async function handleLogout(router: ReturnType<typeof useRouter>) {
  const res = await fetch("/api/auth/logout", { method: "POST" })
  if (!res.ok) throw new Error("Unable to clear session cookie.")
  router.replace("/")
  router.refresh()
}

export function GroupPageView({
  publicKey,
  groupId,
  group,
  hasTreasury,
  fundRounds,
  totalBalance,
  memberContributions,
  status,
}: GroupPageViewProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const {
    createTreasury,
    isLoading: isCreatingTreasury,
    error: createTreasuryError,
    reset: resetCreateTreasury,
  } = useCreateTreasury()

  const {
    proposeFundRound,
    isLoading: isProposingRound,
    error: proposeFundRoundError,
    reset: resetProposeFundRound,
  } = useProposeFundRound()

  const {
    approve: approveTokens,
    contribute: contributeToRound,
    isApproving: isApprovingTokens,
    isContributing,
    error: contributeError,
    reset: resetContribute,
  } = useContributeToFundRound()

  const onCrearTreasury = useCallback(async () => {
    if (!groupId) return
    const groupIdBigInt = BigInt(groupId)
    const hash = await createTreasury(groupIdBigInt)
    if (hash) {
      resetCreateTreasury()
      router.refresh()
    }
  }, [groupId, createTreasury, resetCreateTreasury, router])

  const onProposeFundRound = useCallback(
    async (totalAmountUsdc: number) => {
      if (!groupId) return
      const hash = await proposeFundRound(BigInt(groupId), totalAmountUsdc)
      if (hash) {
        resetProposeFundRound()
        router.refresh()
      } else {
        throw new Error("No se pudo crear la ronda. Revisá el mensaje de error arriba.")
      }
    },
    [groupId, proposeFundRound, resetProposeFundRound, router]
  )

  const onApproveTokens = useCallback(
    async (amountUsdc: number) => {
      const hash = await approveTokens(amountUsdc)
      if (!hash) throw new Error("No se pudo dar permiso. Revisá el mensaje de error arriba.")
    },
    [approveTokens]
  )

  const onContribute = useCallback(
    async (roundId: bigint, amountUsdc: number) => {
      const hash = await contributeToRound(roundId, amountUsdc)
      if (hash) {
        resetContribute()
        router.refresh()
      } else {
        throw new Error("No se pudo aportar. Revisá el mensaje de error arriba.")
      }
    },
    [contributeToRound, resetContribute, router]
  )

  const onLogout = useCallback(async () => {
    if (isLoggingOut) return
    setLogoutError(null)
    setIsLoggingOut(true)
    try {
      await handleLogout(router)
    } catch (e) {
      setLogoutError(
        e instanceof Error ? e.message : "Failed to logout cleanly."
      )
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, router])

  const onBack = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const noopApprove = useCallback(async () => {}, [])
  const noopExecute = useCallback(async () => {}, [])

  const onCreateProposal = useCallback(
    async (_params: { amountUsdc: number; destination: string; description?: string }) => {
      // TODO: wire to useCreateReleaseProposal when available
      router.refresh()
    },
    [router]
  )

  if (status === "invalid_id") {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar
          publicKey={publicKey}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
        <div className="mx-auto max-w-lg px-4 py-12">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Invalid group ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                The group ID must be a valid non-negative number.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (status === "not_found") {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar
          publicKey={publicKey}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
        <div className="mx-auto max-w-lg px-4 py-12">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle>Group not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                No group exists with ID {groupId}.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar
        publicKey={publicKey}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
      />
      {logoutError ? (
        <section className="mx-auto max-w-5xl px-4 pt-4">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{logoutError}</p>
          </div>
        </section>
      ) : null}
      {createTreasuryError ? (
        <section className="mx-auto max-w-5xl px-4 pt-4">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{createTreasuryError.message}</p>
          </div>
        </section>
      ) : null}
      {proposeFundRoundError ? (
        <section className="mx-auto max-w-5xl px-4 pt-4">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{proposeFundRoundError.message}</p>
          </div>
        </section>
      ) : null}
      {contributeError ? (
        <section className="mx-auto max-w-5xl px-4 pt-4">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{contributeError.message}</p>
          </div>
        </section>
      ) : null}
      <GroupDashboardContent
        group={group}
        fundRounds={fundRounds}
        proposals={[]}
        totalBalance={totalBalance}
        hasTreasury={hasTreasury}
        isLoading={false}
        address={publicKey}
        onBack={onBack}
        onApproveTokens={onApproveTokens}
        onContribute={onContribute}
        onApproveProposal={noopApprove}
        onExecuteRelease={noopExecute}
        onCreateProposal={onCreateProposal}
        onCrearTreasury={onCrearTreasury}
        onProposeFundRound={onProposeFundRound}
        isSubmitting={isCreatingTreasury}
        isProposingRound={isProposingRound}
        isApprovingTokens={isApprovingTokens}
        isContributing={isContributing}
        memberContributions={memberContributions}
      />
      <Footer />
    </div>
  )
}
