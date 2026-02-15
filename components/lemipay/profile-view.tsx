"use client"

import { useState } from "react"
import { Users, Plus, Wallet, ChevronRight, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreateGroupModal } from "@/components/modal/CreateGroupModal"

const mockGroups = [
    { id: "1", name: "Proyecto Alpha DAO", members: 5, balance: "12,450 XLM", pending: 2, color: "primary" },
    { id: "2", name: "Viaje Europa 2026", members: 4, balance: "3,200 XLM", pending: 1, color: "secondary" },
]

interface ProfileViewProps {
    address: string
    onSelectGroup: (groupId: string) => void
    onDisconnect: () => void
}

export function ProfileView({ address, onSelectGroup, onDisconnect }: ProfileViewProps) {
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`

    return (
        <main className="container mx-auto max-w-4xl px-4 pt-10 pb-16">
            <div className="glass-card gradient-border mb-10 overflow-hidden p-1 animate-fade-up">
                <div className="rounded-xl bg-background/60 p-6 md:p-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row">
                        <Avatar className="h-20 w-20 border-2 border-primary/30">
                            <AvatarFallback className="bg-primary/15 font-display text-2xl font-bold text-primary">FA</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="font-display text-2xl font-bold text-foreground">Facundo GR.</h1>
                            <p className="mt-1 text-sm text-muted-foreground">{address}</p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-semibold text-foreground">2,340 XLM</span>
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