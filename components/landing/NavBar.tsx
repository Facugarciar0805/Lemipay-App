"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Menu, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  walletConnected: boolean;
  isConnecting?: boolean;
  onConnectWallet: () => void;
}

const Navbar = ({
  walletConnected,
  isConnecting = false,
  onConnectWallet,
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "How It Works", href: "#como-funciona" },
    { label: "Dashboard", href: "#dashboard" },
    { label: "FAQ", href: "#faq" },
  ];

  const buttonLabel = isConnecting
    ? "Connecting..."
    : walletConnected
      ? "Wallet Connected"
      : "Connect Wallet";

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="#" className="flex items-center gap-2.5">
          <img
            src="/images/lemipay-logo.jpeg"
            alt="Lemipay"
            className="h-9 w-9 rounded-lg"
          />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Lemi<span className="gradient-text">pay</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isInternal = link.href.startsWith("/");
            const className =
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
            return isInternal ? (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className={className}>
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Button
            onClick={onConnectWallet}
            disabled={walletConnected || isConnecting}
            className={`gap-2 rounded-xl font-display font-semibold transition-all ${
              walletConnected
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground animate-pulse-glow hover:brightness-110"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {buttonLabel}
          </Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground md:hidden"
          aria-label="Open navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 p-6">
            {navLinks.map((link) => {
              const isInternal = link.href.startsWith("/");
              const className =
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
              return isInternal ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  {link.label}
                </a>
              );
            })}
            <Button
              onClick={() => {
                onConnectWallet();
                setMobileOpen(false);
              }}
              disabled={walletConnected || isConnecting}
              className="mt-2 gap-2 rounded-xl bg-primary font-display font-semibold text-primary-foreground"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {buttonLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
