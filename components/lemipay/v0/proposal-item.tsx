"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsdc } from "@/lib/stellar-client"
import type { Group, ReleaseProposal } from "@/lib/stellar-client"
import {
  Send,
  CheckCircle2,
  Loader2,
  ThumbsUp,
  Zap,
  Clock,
} from "lucide-react"

interface ProposalListProps {
  proposals: ReleaseProposal[]
  group: Group | null
  isLoading: boolean
  onApprove: (proposalId: bigint) => Promise<void>
  onExecute: (proposalId: bigint) => Promise<void>
  isSubmitting: boolean
}

export function ProposalList({
  proposals,
  group,
  isLoading,
  onApprove,
  onExecute,
  isSubmitting,
}: ProposalListProps) {
  const [activeProposalId, setActiveProposalId] = useState<bigint | null>(null)

  const handleApprove = async (id: bigint) => {
    setActiveProposalId(id)
    await onApprove(id)
    setActiveProposalId(null)
  }

  const handleExecute = async (id: bigint) => {
    setActiveProposalId(id)
    await onExecute(id)
    setActiveProposalId(null)
  }

  if (isLoading) {
    return <ProposalsSkeleton />
  }

  const approvalsRequired = group?.approvalsRequired ?? 2

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Propuestas de Pago
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Gastos que requieren aprobacion
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
            {proposals.filter((p) => !p.executed).length} pendientes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {proposals.map((proposal) => {
          const isActive =
            activeProposalId === proposal.id && isSubmitting
          const canExecute =
            proposal.approvals >= approvalsRequired && !proposal.executed
          const shortDest = `${proposal.destination.slice(
            0,
            4
          )}...${proposal.destination.slice(-4)}`

          return (
            <div
              key={Number(proposal.id)}
              className={`flex flex-col gap-3 rounded-lg border p-4 ${
                proposal.executed
                  ? "border-success/20 bg-success/5"
                  : canExecute
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-secondary/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      Pago a {shortDest}
                    </span>
                    {proposal.executed && (
                      <Badge className="bg-success text-success-foreground text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Ejecutado
                      </Badge>
                    )}
                    {canExecute && !proposal.executed && (
                      <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                        <Zap className="h-3 w-3" />
                        Listo
                      </Badge>
                    )}
                    {!canExecute && !proposal.executed && (
                      <Badge
                        variant="outline"
                        className="text-xs border-warning/30 text-warning"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <span className="text-lg font-mono font-bold text-foreground">
                    {formatUsdc(proposal.amount)}{" "}
                    <span className="text-sm text-muted-foreground font-normal">
                      USDC
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Approval counter */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: approvalsRequired }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-6 rounded-full ${
                          i < proposal.approvals
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {proposal.approvals} de {approvalsRequired} firmas
                  </span>
                </div>

                {/* Action buttons */}
                {!proposal.executed && (
                  <div className="flex gap-2">
                    {!canExecute && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleApprove(proposal.id)}
                        disabled={isSubmitting}
                      >
                        {isActive ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Firmando...
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Aprobar
                          </>
                        )}
                      </Button>
                    )}
                    {canExecute && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleExecute(proposal.id)}
                        disabled={isSubmitting}
                      >
                        {isActive ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Ejecutando...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-1" />
                            Ejecutar Pago
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ProposalsSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border/50 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-14" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
