"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsdc } from "@/lib/stellar-client"
import type { Group } from "@/lib/stellar-client"
import { Users, Wallet, ShieldCheck } from "lucide-react"

interface GroupCardProps {
  group: Group | null
  totalBalance: bigint
  isLoading: boolean
}

export function GroupCard({ group, totalBalance, isLoading }: GroupCardProps) {
  if (isLoading) {
    return <GroupCardSkeleton />
  }

  if (!group) {
    return null
  }

  return (
    <Card className="border-border/50 bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Balance del Grupo
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {formatUsdc(totalBalance)} <span className="text-lg text-muted-foreground font-normal">USDC</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {group.members.length} miembros
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function GroupCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
