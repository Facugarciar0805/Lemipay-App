"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Wallet, ChevronRight, DollarSign, Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreateGroupModal } from "@/components/modal/CreateGroupModal"
import { cn } from "@/lib/utils"

const mockGroups = [
    { id: "1", name: "Proyecto Alpha DAO", members: 5, balance: "12,450 USDC", pending: 2, color: "primary" },
    { id: "2", name: "Viaje Europa 2026", members: 4, balance: "3,200 USDC", pending: 1, color: "secondary" },
]

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

    const copyAddress = () => {
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

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

    return (
        <main className="container mx-auto max-w-4xl px-4 pt-10 pb-16">
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
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-opacity group-hover:opacity-100",
                                            copied ? "opacity-100" : "opacity-0"
                                        )}
                                        title={address}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3 w-3 text-primary" />
                                                Copiado
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3" />
                                                Copiar
                                            </>
                                        )}
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

            <div className="animate-fade-up-delay-1">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-foreground">Tus Grupos</h2>
                    <Button onClick={() => setShowCreateGroup(true)} className="bg-primary font-bold text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" /> Nuevo Grupo
                    </Button>
                </div>

                <div className="grid gap-4">
                    {mockGroups.map((group) => (
                        <button key={group.id} onClick={() => onSelectGroup(group.id)} className="glass-card w-full rounded-2xl p-1 text-left hover:scale-[1.01] transition-all">
                            <div className="flex items-center gap-4 rounded-xl bg-background/60 p-6">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${group.color === "primary" ? "bg-primary/15 text-primary" : "bg-brand-purple/15 text-brand-purple"}`}>
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display text-base font-semibold">{group.name}</h3>
                                    <p className="text-xs text-muted-foreground">{group.members} miembros · {group.balance}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <CreateGroupModal
                open={showCreateGroup}
                onOpenChange={setShowCreateGroup}
            />
        </main>
    )
}