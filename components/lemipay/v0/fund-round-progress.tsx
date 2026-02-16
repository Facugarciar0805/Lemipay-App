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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsdc } from "@/lib/stellar-client"
import { xlmToStroops } from "@/lib/stellar-client"
import type { FundRound } from "@/lib/stellar-client"
import { Target, Check, Loader2, TrendingUp } from "lucide-react"

interface FundRoundProgressProps {
  rounds: FundRound[]
  isLoading: boolean
  onContribute: (roundIndex: number, amount: bigint) => Promise<void>
  isSubmitting: boolean
}

const ROUND_LABELS = [
  "Fondo de emergencia",
  "Viaje grupal",
  "Inversiones compartidas",
]

export function FundRoundProgress({
  rounds,
  isLoading,
  onContribute,
  isSubmitting,
}: FundRoundProgressProps) {
  const [contributingIndex, setContributingIndex] = useState<number | null>(null)

  const handleContribute = async (index: number) => {
    setContributingIndex(index)
    // Contribute 10 USDC as a demo amount
    await onContribute(index, xlmToStroops(10))
    setContributingIndex(null)
  }

  if (isLoading) {
    return <FundRoundsSkeleton />
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Rondas de Fondeo
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Metas de ahorro grupal
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
            {rounds.filter((r) => !r.completed).length} activas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rounds.map((round, index) => {
          const percentage = Number(
            (round.fundedAmount * BigInt(100)) / round.totalAmount
          )
          const isContributing = contributingIndex === index && isSubmitting

          return (
            <div
              key={index}
              className="flex flex-col gap-2.5 rounded-lg border border-border/50 bg-secondary/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {ROUND_LABELS[index] || `Ronda #${index + 1}`}
                  </span>
                  {round.completed && (
                    <Badge className="bg-success text-success-foreground text-xs gap-1">
                      <Check className="h-3 w-3" />
                      Completada
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {formatUsdc(round.fundedAmount)}/{formatUsdc(round.totalAmount)} USDC
                </span>
              </div>

              <Progress value={percentage} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {percentage}% financiado
                </span>
                {!round.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleContribute(index)}
                    disabled={isSubmitting}
                  >
                    {isContributing ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Aportar 10 USDC
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function FundRoundsSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 rounded-lg border border-border/50 p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
