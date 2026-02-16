"use client"

import { useState } from "react";
import {
    ArrowLeft,
    Users,
    Crown,
    User,
    Check,
    Clock,
    Target,
    Plus,
    Wallet,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MembersPanel } from "@/components/lemipay/v0/members-panel";
import { ProposeFundRoundModal } from "@/components/modal/ProposeFundRoundModal";
import { ContributeModal } from "@/components/modal/ContributeModal";
import { CreatePaymentProposalModal } from "@/components/modal/CreatePaymentProposalModal";
import { formatUsdc, type FundRound, type Group, type ReleaseProposal } from "@/lib/stellar-client";
import { ContributionsPanel } from "./contributions-panel";

export interface GroupDashboardContentProps {
    group: Group | null
    fundRounds: FundRound[]
    proposals: ReleaseProposal[]
    totalBalance: bigint
    hasTreasury?: boolean
    isLoading: boolean
    address: string
    onBack: () => void
    onApproveTokens?: (amountUsdc: number) => Promise<void>
    onContribute: (roundId: bigint, amountUsdc: number) => Promise<void>
    onApproveProposal: (proposalId: bigint) => Promise<void>
    onExecuteRelease: (proposalId: bigint) => Promise<void>
    onCreateProposal?: (params: { amountUsdc: number; destination: string }) => Promise<void>
    onCrearTreasury?: () => Promise<void>
    onProposeFundRound?: (totalAmountUsdc: number) => Promise<void>
    isSubmitting: boolean
    isProposingRound?: boolean
    isApprovingTokens?: boolean
    isContributing?: boolean
    memberContributions: { address: string; name?: string; totalAmount: bigint }[];
}

export function GroupDashboardContent({
                                          group,
                                          fundRounds,
                                          proposals,
                                          totalBalance,
                                          hasTreasury = true,
                                          isLoading,
                                          address,
                                          onBack,
                                          onApproveTokens,
                                          onContribute,
                                          onApproveProposal,
                                          onExecuteRelease,
                                          onCreateProposal,
                                          onCrearTreasury,
                                          onProposeFundRound,
                                          isSubmitting,
                                          memberContributions,
                                          isProposingRound = false,
                                          isApprovingTokens = false,
                                          isContributing = false,
                                      }: GroupDashboardContentProps) {
    const [proposeRoundModalOpen, setProposeRoundModalOpen] = useState(false);
    const [contributeModalOpen, setContributeModalOpen] = useState(false);
    const [createProposalModalOpen, setCreateProposalModalOpen] = useState(false);

    // Función auxiliar interna compatible con ES anteriores a 2020
    const safeBigInt = (val: any): bigint => {
        try {
            return BigInt(val || 0);
        } catch {
            return BigInt(0); // Cambiado: 0n -> BigInt(0)
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground font-display">Sincronizando con Stellar...</p>
            </div>
        );
    }

    const activeRound = fundRounds?.find((r) => !r.completed) ?? null
    const lastRound = fundRounds?.length ? fundRounds[fundRounds.length - 1] : null
    const allRoundsComplete = (fundRounds?.length ?? 0) > 0 && !activeRound

    const totalAmount = (activeRound ?? lastRound) ? safeBigInt((activeRound ?? lastRound)!.totalAmount) : BigInt(0)
    const fundedAmount = (activeRound ?? lastRound) ? safeBigInt((activeRound ?? lastRound)!.fundedAmount) : BigInt(0)
    const progressPercent = (activeRound && totalAmount > BigInt(0))
        ? Number((fundedAmount * BigInt(100)) / totalAmount)
        : allRoundsComplete ? 100 : 0

    return (
        <main className="container mx-auto max-w-4xl px-4 pt-10 pb-16">
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Mis Grupos
            </button>

            {/* ─── 1. HERO BALANCE o CREAR TESORERÍA ─── */}
            <section className="glass-card gradient-border mb-8 overflow-hidden p-1 animate-fade-up">
                <div className="rounded-xl bg-background/60 p-8 text-center md:p-12">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {group?.name || "Tesorería Grupal"}
                    </p>
                    {hasTreasury ? (
                        <>
                            <p
                                className="mt-4 font-display text-5xl font-bold text-primary sm:text-6xl md:text-7xl"
                                style={{ textShadow: "0 0 30px hsla(var(--brand-lime), 0.35), 0 0 60px hsla(var(--brand-lime), 0.15)" }}
                            >
                                {formatUsdc(totalBalance)}
                                <span className="ml-2 text-lg font-normal text-muted-foreground sm:text-xl">USDC</span>
                            </p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Quórum: <span className="font-semibold text-brand-purple">{group?.threshold ?? 2}</span> firmas requeridas
                            </p>
                        </>
                    ) : (
                        <div className="mt-6">
                            <Button
                                disabled={isSubmitting}
                                onClick={() => onCrearTreasury?.()}
                                className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground hover:glow-lime"
                            >
                                CREAR TESORERÍA
                            </Button>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Este grupo aún no tiene tesorería. Créala para poder fondear y gestionar pagos.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── 2. MIEMBROS ─── */}
            <section className="mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Miembros
                </h2>
                <MembersPanel
                    group={group}
                    isLoading={isLoading}
                    currentAddress={address}
                />
            </section>

            {/* ─── 3. RELEASE PROPOSALS ─── */}
            <section className="mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Propuestas de Pago
                    </h2>
                    {onCreateProposal && (
                        <Button
                            onClick={() => setCreateProposalModalOpen(true)}
                            disabled={isSubmitting}
                            size="sm"
                            className="gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:brightness-110"
                        >
                            <Plus className="h-4 w-4" />
                            Crear propuesta de pago
                        </Button>
                    )}
                </div>
                {onCreateProposal && (
                    <CreatePaymentProposalModal
                        open={createProposalModalOpen}
                        onOpenChange={setCreateProposalModalOpen}
                        onSubmit={onCreateProposal}
                        isSubmitting={isSubmitting}
                    />
                )}
                {proposals.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <Check className="mx-auto h-8 w-8 text-primary/40" />
                        <p className="mt-3 text-sm text-muted-foreground">Sin pagos pendientes</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {proposals.map((p) => {
                            const currentApprovals = safeBigInt(p.approvals);
                            const threshold = group?.approvalsRequired ?? 2;
                            const isReadyToExecute = currentApprovals >= threshold;
                            const description = (p as { description?: string }).description ?? `${p.destination.slice(0, 6)}…${p.destination.slice(-4)}`;
                            const amountUsdc = (Number(p.amount) / 1e7).toFixed(2);

                            return (
                                <div key={String(p.id)} className="glass-card overflow-hidden rounded-2xl p-1">
                                    <div className="flex flex-col gap-4 rounded-xl bg-background/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{description}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Monto: <span className="font-semibold text-primary">{amountUsdc} USDC</span>
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {currentApprovals.toString()} de {threshold} firmas
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {isReadyToExecute ? (
                                                <Button
                                                    disabled={isSubmitting}
                                                    onClick={() => onExecuteRelease(p.id)}
                                                    className="w-full rounded-xl bg-primary px-6 font-bold text-primary-foreground sm:w-auto hover:glow-lime"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Ejecutar Pago"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled={isSubmitting}
                                                    onClick={() => onApproveProposal(p.id)}
                                                    className="w-full rounded-xl bg-brand-purple px-6 font-bold text-white sm:w-auto hover:brightness-110"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Firmar"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ─── 4. FUND ROUNDS ─── */}
            <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Recaudación de Fondos
                </h2>
                {activeRound ? (
                    <div className="glass-card gradient-border overflow-hidden rounded-2xl p-1">
                        <div className="rounded-xl bg-background/60 p-6 md:p-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Objetivo</p>
                                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                                        {formatUsdc(totalAmount)} <span className="text-sm font-normal text-muted-foreground">USDC</span>
                                    </p>
                                </div>
                                <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary animate-pulse">Activa</span>
                            </div>
                            <div className="mt-6">
                                <div className="mb-2 flex items-end justify-between">
                                    <span className="text-sm font-semibold text-primary">{formatUsdc(fundedAmount)} USDC</span>
                                    <span className="text-xs text-muted-foreground">{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-3 bg-muted" />
                            </div>
                            <Button
                                disabled={isContributing}
                                onClick={() => setContributeModalOpen(true)}
                                className="mt-6 w-full gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground hover:glow-lime sm:w-auto sm:px-8 transition-all"
                            >
                                {isContributing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wallet className="h-4 w-4" /> Aportar USDC</>}
                            </Button>
                            {onApproveTokens && (
                                <ContributeModal
                                    open={contributeModalOpen}
                                    onOpenChange={setContributeModalOpen}
                                    onApprove={onApproveTokens}
                                    onContribute={(amountUsdc) => onContribute(activeRound.id, amountUsdc)}
                                    isApproving={isApprovingTokens}
                                    isContributing={isContributing}
                                />
                            )}
                        </div>
                    </div>
                ) : allRoundsComplete ? (
                    <div className="glass-card gradient-border overflow-hidden rounded-2xl p-1">
                        <div className="rounded-xl bg-background/60 p-6 md:p-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Objetivo</p>
                                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                                        {formatUsdc(totalAmount)} <span className="text-sm font-normal text-muted-foreground">USDC</span>
                                    </p>
                                </div>
                                <span className="rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold text-primary">Completada</span>
                            </div>
                            <div className="mt-6">
                                <div className="mb-2 flex items-end justify-between">
                                    <span className="text-sm font-semibold text-primary">{formatUsdc(fundedAmount)} USDC</span>
                                    <span className="text-xs text-muted-foreground">100%</span>
                                </div>
                                <Progress value={100} className="h-3 bg-muted" />
                            </div>
                            {onProposeFundRound && (
                                <>
                                    <Button
                                        onClick={() => setProposeRoundModalOpen(true)}
                                        disabled={isProposingRound}
                                        className="mt-6 w-full gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground hover:glow-lime sm:w-auto sm:px-8"
                                    >
                                        {isProposingRound ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear otra ronda"}
                                    </Button>
                                    <ProposeFundRoundModal
                                        open={proposeRoundModalOpen}
                                        onOpenChange={setProposeRoundModalOpen}
                                        onPropose={onProposeFundRound}
                                        isSubmitting={isProposingRound}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <p className="text-muted-foreground mb-4">
                            No hay rondas de fondeo activas.
                        </p>
                        {onProposeFundRound ? (
                            <>
                                <Button
                                    onClick={() => setProposeRoundModalOpen(true)}
                                    disabled={isProposingRound}
                                    className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:glow-lime"
                                >
                                    {isProposingRound ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Crear ronda de fondeo"
                                    )}
                                </Button>
                                <ProposeFundRoundModal
                                    open={proposeRoundModalOpen}
                                    onOpenChange={setProposeRoundModalOpen}
                                    onPropose={onProposeFundRound}
                                    isSubmitting={isProposingRound}
                                />
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Creá una ronda para que el grupo pueda aportar fondos.
                            </p>
                        )}
                    </div>
                )}
            </section>
            {/* ─── 4. Contributions Panel ─── */}

            <section>
                <ContributionsPanel
                    contributions={memberContributions}
                    isLoading={isLoading}
                />
            </section>

        </main>
    );
}