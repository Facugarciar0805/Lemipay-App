"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { FundRound, ReleaseProposal } from "@/lib/stellar-client"
import { Target, Send, CheckCircle2 } from "lucide-react"

interface StatCardsProps {
  fundRounds: FundRound[]
  proposals: ReleaseProposal[]
  isLoading: boolean
}

export function StatCards({
  fundRounds,
  proposals,
  isLoading,
}: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-8" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const activeRounds = fundRounds.filter((r) => !r.completed).length
  const pendingProposals = proposals.filter((p) => !p.executed).length
  const executedProposals = proposals.filter((p) => p.executed).length

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3 w-3" />
            Rondas Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{activeRounds}</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Send className="h-3 w-3" />
            Por Aprobar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-warning">{pendingProposals}</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Ejecutados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-success">{executedProposals}</p>
        </CardContent>
      </Card>
    </div>
  )
}
