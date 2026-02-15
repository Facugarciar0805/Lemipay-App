"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Group } from "@/lib/stellar-client"
import { Users } from "lucide-react"

interface MembersPanelProps {
  group: Group | null
  isLoading: boolean
  currentAddress?: string | null
}

const MEMBER_NAMES = ["Alex", "Sam", "Jordan"]
const MEMBER_COLORS = [
  "bg-primary/20 text-primary",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-4/20 text-chart-4",
]

export function MembersPanel({
  group,
  isLoading,
  currentAddress = null,
}: MembersPanelProps) {
  if (isLoading) {
    return <MembersSkeleton />
  }

  if (!group) return null

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Miembros
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {group.members.map((member, i) => {
          const isYou = member === currentAddress
          const shortAddr = `${member.slice(0, 6)}...${member.slice(-4)}`
          return (
            <div
              key={member}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className={`text-xs font-semibold ${MEMBER_COLORS[i % MEMBER_COLORS.length]}`}
                >
                  {(MEMBER_NAMES[i] || "U")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm text-foreground">
                  {MEMBER_NAMES[i] || `Miembro ${i + 1}`}
                  {isYou && (
                    <span className="ml-1.5 text-xs text-primary">(tu)</span>
                  )}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {shortAddr}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function MembersSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-1.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
