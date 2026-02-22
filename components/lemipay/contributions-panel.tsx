"use client"

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, ArrowUpRight, ArrowDownLeft, Info, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatUsdc } from "@/lib/stellar-client";
import { WithdrawContributionModal } from "@/components/modal/WithdrawContributionModal";

const USDC_DECIMALS = 10_000_000;

function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/** If balance is missing, derive from totalAmount and fair share (for mock or client-only). */
function withBalances(
  items: ContributionItem[]
): { address: string; name?: string; totalAmount: bigint; balance: number }[] {
  if (items.length === 0) return [];
  const hasAnyBalance = items.some((m) => m.balance !== undefined && m.balance !== null);
  if (hasAnyBalance) {
    return items.map((m) => ({ ...m, balance: m.balance ?? 0 }));
  }
  const totalRaw = items.reduce((acc, m) => acc + m.totalAmount, BigInt(0));
  const fairShare = Number(totalRaw) / USDC_DECIMALS / items.length;
  return items.map((m) => ({
    ...m,
    balance: Number(m.totalAmount) / USDC_DECIMALS - fairShare,
  }));
}

export interface ContributionItem {
  address: string;
  name?: string;
  totalAmount: bigint;
  balance?: number;
}

export function ContributionsPanel({
  contributions = [],
  isLoading = false,
  currentUserAddress,
  activeRoundId,
  onWithdraw,
  isWithdrawing = false,
}: {
  contributions?: ContributionItem[];
  isLoading?: boolean;
  currentUserAddress?: string;
  activeRoundId?: bigint;
  onWithdraw?: (roundId: bigint) => Promise<void>;
  isWithdrawing?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"aportes" | "saldos">("aportes");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const withBalance = withBalances(contributions);

  const sortedAportes = [...withBalance].sort((a, b) =>
    a.totalAmount > b.totalAmount ? -1 : a.totalAmount < b.totalAmount ? 1 : 0
  );
  const sortedSaldos = [...withBalance].sort((a, b) => b.balance - a.balance);

  const isCurrentUser = contributions.some((c) => c.address === currentUserAddress);

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

                    {onWithdraw && activeRoundId && isCurrentUser && (
                        <WithdrawContributionModal
                            open={withdrawModalOpen}
                            onOpenChange={setWithdrawModalOpen}
                            onWithdraw={() => onWithdraw(activeRoundId)}
                            isSubmitting={isWithdrawing}
                            roundId={activeRoundId}
                        />
                    )}

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Cargando aportes...</span>
                            </div>
                        ) : (activeTab === "aportes" ? sortedAportes : sortedSaldos).length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                {activeTab === "aportes"
                                  ? "Aún no hay aportes en las rondas de fondeo."
                                  : "No hay saldos que mostrar."}
                            </div>
                        ) : (
                            (activeTab === "aportes" ? sortedAportes : sortedSaldos).map((member, i) => {
                                const isPositive = (member.balance ?? 0) > 0;
                                const displayName = member.name ?? shortAddress(member.address);
                                const initial = displayName[0]?.toUpperCase() ?? "?";
                                const isCurrentUserMember = member.address === currentUserAddress;

                                return (
                                    <div
                                        key={member.address}
                                        className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/10 p-4 transition-all hover:bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className={`h-10 w-10 border ${activeTab === "aportes" && i === 0 ? "border-primary" : "border-border/50"}`}>
                                                    <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
                                                        {initial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {activeTab === "aportes" && i === 0 && (
                                                    <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1">
                                                        <Award className="h-3 w-3 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{displayName}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {activeTab === "aportes" ? "Aportante" : isPositive ? "Al día" : "Pendiente"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                {activeTab === "aportes" ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-display text-lg font-bold text-primary">
                                                            {formatUsdc(member.totalAmount)}{" "}
                                                            <span className="text-[10px] text-muted-foreground">USDC</span>
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end">
                                                        <div className={`flex items-center gap-1 font-display text-lg font-bold ${isPositive ? "text-primary" : "text-brand-purple"}`}>
                                                            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                                            {Math.abs(member.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                            <span className="text-[10px] opacity-70">USDC</span>
                                                        </div>
                                                        <p className={`text-[10px] font-medium ${isPositive ? "text-primary/70" : "text-brand-purple/70"}`}>
                                                            {isPositive ? "a favor" : "debe aportar"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {onWithdraw && activeRoundId && isCurrentUserMember && activeTab === "aportes" && (
                                                <Button
                                                    onClick={() => setWithdrawModalOpen(true)}
                                                    disabled={isWithdrawing}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5 rounded-lg px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                                                    title="Retirar aporte de esta ronda"
                                                >
                                                    {isWithdrawing ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <LogOut className="h-3.5 w-3.5" />
                                                            <span className="hidden sm:inline">Retirar</span>
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}