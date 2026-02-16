"use client"

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, ArrowUpRight, ArrowDownLeft, Info } from "lucide-react";

// MOCKS: Simulando una ronda donde la meta por persona era ~6000 USDC
const MOCK_DATA = [
    { address: "addr1", name: "Santiago M.", totalAmount: BigInt(12500), balance: 6500 },
    { address: "addr2", name: "María L.", totalAmount: BigInt(5400), balance: -600 },
    { address: "addr3", name: "Carlos R.", totalAmount: BigInt(3200), balance: -2800 },
    { address: "addr4", name: "Ana G.", totalAmount: BigInt(1500), balance: -4500 },
];

export function ContributionsPanel() {
    const [activeTab, setActiveTab] = useState<"aportes" | "saldos">("aportes");

    const sortedAportes = [...MOCK_DATA].sort((a, b) => Number(b.totalAmount - a.totalAmount));
    const sortedSaldos = [...MOCK_DATA].sort((a, b) => b.balance - a.balance);

    return (
        <section className="mt-8 animate-fade-up">
            {/* ─── TABS TOGGLE ─── */}
            <div className="mb-6 flex justify-center">
                <div className="inline-flex rounded-xl bg-muted/30 p-1 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab("aportes")}
                        className={`rounded-lg px-6 py-2 text-xs font-bold transition-all ${
                            activeTab === "aportes"
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Total Aportado
                    </button>
                    <button
                        onClick={() => setActiveTab("saldos")}
                        className={`rounded-lg px-6 py-2 text-xs font-bold transition-all ${
                            activeTab === "saldos"
                                ? "bg-brand-purple text-white shadow-lg"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Saldos y Deudas
                    </button>
                </div>
            </div>

            <div className="glass-card gradient-border overflow-hidden rounded-2xl p-1">
                <div className="rounded-xl bg-background/60 p-5">

                    {/* INFO TOOLTIP MOCK */}
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-[11px] text-primary">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>
                            {activeTab === "aportes"
                                ? "Historial total de USDC enviados a la tesorería desde la creación del grupo."
                                : "Cálculo basado en la meta equitativa de las rondas de fondeo activas."}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {(activeTab === "aportes" ? sortedAportes : sortedSaldos).map((member, i) => {
                            const isPositive = member.balance > 0;

                            return (
                                <div
                                    key={member.address}
                                    className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/10 p-4 transition-all hover:bg-muted/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className={`h-10 w-10 border ${activeTab === 'aportes' && i === 0 ? 'border-primary' : 'border-border/50'}`}>
                                                <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
                                                    {member.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            {activeTab === "aportes" && i === 0 && (
                                                <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1">
                                                    <Award className="h-3 w-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {activeTab === "aportes" ? "Aportante" : (isPositive ? "Al día" : "Pendiente")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {activeTab === "aportes" ? (
                                            <div className="flex flex-col items-end">
                                                <span className="font-display text-lg font-bold text-primary">
                                                    {member.totalAmount.toLocaleString()} <span className="text-[10px] text-muted-foreground">USDC</span>
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <div className={`flex items-center gap-1 font-display text-lg font-bold ${isPositive ? 'text-primary' : 'text-brand-purple'}`}>
                                                    {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                                    {Math.abs(member.balance).toLocaleString()}
                                                    <span className="text-[10px] opacity-70">USDC</span>
                                                </div>
                                                <p className={`text-[10px] font-medium ${isPositive ? 'text-primary/70' : 'text-brand-purple/70'}`}>
                                                    {isPositive ? "a favor" : "debe aportar"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}