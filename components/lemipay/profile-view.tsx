"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Wallet, ChevronRight, DollarSign, Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreateGroupModal } from "@/components/modal/CreateGroupModal"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
    address: string
    onSelectGroup: (groupId: string) => void
    onDisconnect: () => void
}

function getInitials(displayName: string | null, address: string): string {
    if (displayName && displayName.trim()) {
        const parts = displayName.trim().split(/\s+/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
        }
        return displayName.trim().slice(0, 2).toUpperCase()
    }
    return address.slice(0, 2).toUpperCase()
}

export function ProfileView({ address, onSelectGroup, onDisconnect }: ProfileViewProps) {
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const [usdcBalance, setUsdcBalance] = useState<string | null>(null)
    const [displayName, setDisplayName] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // NUEVO: Estado para los grupos reales
    const [groups, setGroups] = useState<any[]>([])
    const [isLoadingGroups, setIsLoadingGroups] = useState(true)

    const copyAddress = () => {
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    // 1. Fetch Balance USDC
    useEffect(() => {
        let cancelled = false
        setUsdcBalance(null)
        fetch(`/api/account/balance?address=${encodeURIComponent(address)}`)
            .then((res) => res.json())
            .then((data: { usdc?: string }) => {
                if (!cancelled && typeof data.usdc === "string") setUsdcBalance(data.usdc)
            })
            .catch(() => {
                if (!cancelled) setUsdcBalance("0.00")
            })
        return () => { cancelled = true }
    }, [address])

    // 2. Fetch Profile Display Name
    useEffect(() => {
        let cancelled = false
        fetch("/api/profile", { credentials: "include" })
            .then((res) => res.json())
            .then((data: { displayName?: string | null }) => {
                if (!cancelled && typeof data.displayName === "string" && data.displayName.trim()) {
                    setDisplayName(data.displayName.trim())
                } else if (!cancelled) {
                    setDisplayName(null)
                }
            })
            .catch(() => {
                if (!cancelled) setDisplayName(null)
            })
        return () => { cancelled = true }
    }, [])

    // 3. NUEVO: Fetch Grupos desde Supabase (vía API)
    useEffect(() => {
        let cancelled = false
        setIsLoadingGroups(true)

        // Llamamos al endpoint que usa la función getWalletGroups que armamos
        fetch(`/api/groups?address=${encodeURIComponent(address)}`)
            .then((res) => res.json())
            .then((data: { groups: any[] }) => {
                if (!cancelled) {
                    setGroups(data.groups || [])
                    setIsLoadingGroups(false)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setGroups([])
                    setIsLoadingGroups(false)
                }
            })
        return () => { cancelled = true }
    }, [address])

    return (
        <main className="container mx-auto max-w-4xl px-4 pt-10 pb-16">
            {/* Profile Card */}
            <div className="glass-card gradient-border mb-10 overflow-hidden p-1 animate-fade-up">
                <div className="rounded-xl bg-background/60 p-6 md:p-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row">
                        <Avatar className="h-20 w-20 border-2 border-primary/30">
                            <AvatarFallback className="bg-primary/15 font-display text-2xl font-bold text-primary">
                                {getInitials(displayName, address)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                {displayName ?? address.slice(0, 6) + "…" + address.slice(-6)}
                            </h1>
                            <div className="mt-1 block">
                                <div className="group inline-flex cursor-pointer items-center gap-1.5" onClick={copyAddress}>
                                    <span className="font-mono text-xs text-muted-foreground/70">
                                        {address.slice(0, 6)}…{address.slice(-6)}
                                    </span>
                                    <span className={cn(
                                        "inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-opacity group-hover:opacity-100",
                                        copied ? "opacity-100" : "opacity-0"
                                    )}>
                                        {copied ? <><Check className="h-3 w-3 text-primary" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 block">
                                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                                    {usdcBalance === null ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                    ) : (
                                        <span className="text-sm font-semibold text-foreground">{usdcBalance} USDC</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={onDisconnect} className="gap-2 rounded-xl border-border/50 text-muted-foreground">
                            <Wallet className="h-4 w-4" /> Desconectar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Groups Section */}
            <div className="animate-fade-up-delay-1">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-foreground">Tus Grupos</h2>
                    <Button onClick={() => setShowCreateGroup(true)} className="bg-primary font-bold text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" /> Nuevo Grupo
                    </Button>
                </div>

                {isLoadingGroups ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="glass-card rounded-2xl border border-dashed border-border p-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground/20" />
                        <p className="mt-4 text-sm text-muted-foreground">Aún no perteneces a ningún grupo.</p>
                        <Button onClick={() => setShowCreateGroup(true)} variant="link" className="mt-2 text-primary">
                            Crea tu primer grupo ahora
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {groups.map((group, i) => (
                            <button
                                key={group.id}
                                onClick={() => onSelectGroup(group.id)}
                                className="glass-card w-full rounded-2xl p-1 text-left hover:scale-[1.01] transition-all"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex items-center gap-4 rounded-xl bg-background/60 p-6">
                                    <div className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-xl",
                                        i % 2 === 0 ? "bg-primary/15 text-primary" : "bg-brand-purple/15 text-brand-purple"
                                    )}>
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display text-base font-semibold">
                                            {group.name || `Grupo #${group.id}`}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {group.member_count || '—'} miembros · {group.balance || '0.00'} USDC
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <CreateGroupModal
                open={showCreateGroup}
                onOpenChange={setShowCreateGroup}
            />
        </main>
    )
}