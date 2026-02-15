import { Wallet, ArrowDown, Loader2 } from "lucide-react"; // Agregamos Loader2
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
    walletConnected: boolean;
    onConnectWallet: () => void;
    isConnecting?: boolean; // Prop opcional para el estado de carga
}

const HeroSection = ({ walletConnected, onConnectWallet, isConnecting }: HeroSectionProps) => {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
            {/* Decorative circles - Mantener igual */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 animate-float" />
                <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/10" style={{ animationDelay: "1s" }} />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <div className="animate-fade-up">
                    <span className="mb-6 inline-block rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                        Finanzas colaborativas en Stellar
                    </span>
                </div>

                <h1 className="animate-fade-up-delay-1 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    El dinero de tus amigos,{" "}
                    <span className="gradient-text">bajo control mutuo</span>
                </h1>

                <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                    Crea grupos, fondea tesorerías y aprobá gastos en la red Stellar sin complicaciones técnicas
                </p>

                <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Button
                        size="lg"
                        onClick={onConnectWallet}
                        disabled={isConnecting || walletConnected} // Desactivar si está cargando o ya conectado
                        className="gap-2.5 rounded-2xl bg-primary px-8 py-6 font-display text-base font-bold text-primary-foreground animate-pulse-glow hover:brightness-110 transition-all"
                    >
                        {isConnecting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Wallet className="h-5 w-5" />
                        )}

                        {isConnecting
                            ? "Conectando..."
                            : walletConnected ? "Wallet Conectada ✓" : "Conectar Wallet"}
                    </Button>
                    <a
                        href="#como-funciona"
                        className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Descubre cómo funciona
                        <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                    </a>
                </div>

                {walletConnected && (
                    <div className="mt-8 animate-fade-up">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Wallet conectada — ¡Explora el dashboard!
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;