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
import type { Group } from "@/lib/stellar-client"

export type GroupPageStatus = "ok" | "invalid_id" | "not_found"

export interface GroupPageViewProps {
  publicKey: string
  groupId: string
  group: Group | null
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
  status,
}: GroupPageViewProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

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

  const noopContribute = useCallback(async () => {}, [])
  const noopApprove = useCallback(async () => {}, [])
  const noopExecute = useCallback(async () => {}, [])

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
      <GroupDashboardContent
        group={group}
        fundRounds={[]}
        proposals={[]}
        totalBalance={BigInt(0)}
        isLoading={false}
        address={publicKey}
        onBack={onBack}
        onContribute={noopContribute}
        onApproveProposal={noopApprove}
        onExecuteRelease={noopExecute}
        isSubmitting={false}
      />
      <Footer />
    </div>
  )
}
