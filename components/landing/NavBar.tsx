import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
    walletConnected: boolean;
    onConnectWallet: () => void;
}

const Navbar = ({ walletConnected, onConnectWallet }: NavbarProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: "Cómo Funciona", href: "#como-funciona" },
        { label: "Dashboard", href: "#dashboard" },
        { label: "FAQ", href: "#faq" },
    ];

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2.5">
                    <img src="/images/lemipay-logo.jpeg" alt="Lemipay" className="h-9 w-9 rounded-lg" />
                    <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Lemi<span className="gradient-text">pay</span>
          </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:block">
                    <Button
                        onClick={onConnectWallet}
                        className={`gap-2 rounded-xl font-display font-semibold transition-all ${
                            walletConnected
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-primary text-primary-foreground animate-pulse-glow hover:brightness-110"
                        }`}
                    >
                        <Wallet className="h-4 w-4" />
                        {walletConnected ? "G...X4kQ" : "Conectar Wallet"}
                    </Button>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-foreground md:hidden"
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="border-t border-border/30 bg-background/95 backdrop-blur-xl md:hidden">
                    <div className="flex flex-col gap-4 p-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        ))}
                        <Button
                            onClick={() => { onConnectWallet(); setMobileOpen(false); }}
                            className="mt-2 gap-2 rounded-xl bg-primary font-display font-semibold text-primary-foreground"
                        >
                            <Wallet className="h-4 w-4" />
                            {walletConnected ? "Wallet Conectada" : "Conectar Wallet"}
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
