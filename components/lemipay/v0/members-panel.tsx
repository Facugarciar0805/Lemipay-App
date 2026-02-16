"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Group } from "@/lib/stellar-client"
import { Crown, User } from "lucide-react"

interface MembersPanelProps {
    group: Group | null
    isLoading: boolean
    currentAddress?: string | null
}

const MEMBER_NAMES = ["Santiago M.", "María L.", "Carlos R.", "Ana G.", "Diego P."]

export function MembersPanel({
                                 group,
                                 isLoading,
                                 currentAddress = null,
                             }: MembersPanelProps) {
    if (isLoading) {
        return <MembersSkeleton />
    }

    if (!group || !group.members) return null

    return (
        <div className="flex flex-wrap gap-3">
            {group.members.map((member, i) => {
                const isYou = member === currentAddress;
                const isAdmin = i === 0; // Por defecto el primero suele ser el creador/admin

                // Blindaje para evitar el error de slice si la dirección no cargó
                const shortAddr = member
                    ? `${member.slice(0, 4)}...${member.slice(-4)}`
                    : "G...X4kQ";

                const name = MEMBER_NAMES[i] || `Miembro ${i + 1}`;
                const initials = name.split(" ").map(n => n[0]).join("");

                return (
                    <div
                        key={member || i}
                        className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:brightness-110"
                    >
                        <Avatar className={`h-10 w-10 border-2 ${isAdmin ? "border-primary/50" : "border-border/50"}`}>
                            <AvatarFallback
                                className={`font-display text-xs font-bold ${
                                    isAdmin
                                        ? "bg-primary/15 text-primary"
                                        : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-foreground">
                  {name}
                </span>
                                {isYou && (
                                    <span className="text-[10px] font-semibold text-primary">(tú)</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    {isAdmin ? (
                                        <>
                                            <Crown className="h-3 w-3 text-primary" />
                                            <span className="text-primary/80">Admin</span>
                                        </>
                                    ) : (
                                        <>
                                            <User className="h-3 w-3" />
                                            <span>Miembro</span>
                                        </>
                                    )}
                                </p>
                                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  • {shortAddr}
                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function MembersSkeleton() {
    return (
        <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-muted/20 px-4 py-3 border border-border/50">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>
    )
}