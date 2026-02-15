import { Check, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const proposals = [
    {
        id: 1,
        title: "Pago servidor hosting",
        amount: "150 USDC",
        author: "María L.",
        votes: "3/5",
        status: "pending" as const,
    },
    {
        id: 2,
        title: "Diseño de logo nuevo",
        amount: "300 USDC",
        author: "Carlos R.",
        votes: "4/5",
        status: "pending" as const,
    },
    {
        id: 3,
        title: "Suscripción herramientas",
        amount: "45 USDC",
        author: "Ana G.",
        votes: "5/5",
        status: "approved" as const,
    },
];

interface DashboardPreviewProps {
    walletConnected: boolean;
}

const DashboardPreview = ({ walletConnected }: DashboardPreviewProps) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="dashboard" className="relative py-24 px-4 md:px-6">
            <div ref={ref} className="container mx-auto max-w-5xl">
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <span className="mb-3 inline-block text-sm font-medium text-brand-purple">Vista previa</span>
                    <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                        Tu <span className="gradient-text">Dashboard</span>
                    </h2>
                </div>

                <div className={`glass-card gradient-border overflow-hidden p-1 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
                    <div className="rounded-xl bg-background/60 p-6 md:p-8">
                        {/* Top bar */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Grupo activo</p>
                                <h3 className="font-display text-lg font-semibold text-foreground">
                                    {!walletConnected ? "Proyecto Alpha DAO" : "Conecta tu wallet"}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${!walletConnected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                                <span className="text-xs text-muted-foreground">{!walletConnected ? "En línea" : "Desconectado"}</span>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Balance card */}
                            <div className="glass-card rounded-xl p-6 glow-lime">
                                <p className="text-xs font-medium text-muted-foreground">Balance del Treasury</p>
                                <p className="mt-2 font-display text-3xl font-bold text-primary">
                                    {!walletConnected ? "12,450" : "—"}
                                    <span className="ml-1 text-base font-normal text-muted-foreground">USDC</span>
                                </p>
                                <div className="mt-4 flex items-center gap-1 text-xs text-primary">
                                    <ArrowUpRight className="h-3 w-3" />
                                    <span>+8.2% este mes</span>
                                </div>
                            </div>

                            {/* Members */}
                            <div className="glass-card rounded-xl p-6">
                                <p className="text-xs font-medium text-muted-foreground">Miembros</p>
                                <p className="mt-2 font-display text-3xl font-bold text-foreground">
                                    {!walletConnected ? "5" : "—"}
                                </p>
                                <div className="mt-4 flex -space-x-2">
                                    {!walletConnected && [..."MCARD"].map((letter, i) => (
                                        <div
                                            key={i}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground"
                                        >
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pending */}
                            <div className="glass-card rounded-xl p-6">
                                <p className="text-xs font-medium text-muted-foreground">Propuestas Pendientes</p>
                                <p className="mt-2 font-display text-3xl font-bold text-brand-purple">
                                    {!walletConnected ? "2" : "—"}
                                </p>
                                <p className="mt-4 text-xs text-muted-foreground">Esperando tu voto</p>
                            </div>
                        </div>

                        {/* Proposals feed */}
                        <div className="mt-8">
                            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">
                                Propuestas Recientes
                            </h4>
                            <div className="space-y-3">
                                {proposals.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex flex-col gap-3 rounded-xl border border-border/30 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{p.title}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                por {p.author} · {p.amount} · Votos: {p.votes}
                                            </p>
                                        </div>
                                        {p.status === "approved" ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                        <Check className="h-3 w-3" /> Aprobada
                      </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> Pendiente
                        </span>
                                                {!walletConnected && (
                                                    <Button
                                                        size="sm"
                                                        className="rounded-lg bg-secondary px-4 text-xs font-semibold text-secondary-foreground hover:brightness-110"
                                                    >
                                                        Aprobar
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardPreview;
