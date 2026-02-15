"use client";

import Image from "next/image";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardNavbarProps {
  publicKey: string;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

function getShortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function DashboardNavbar({
  publicKey,
  onLogout,
  isLoggingOut,
}: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/lemipay-logo.jpeg"
            alt="Lemipay logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Lemipay Dashboard
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" />
              TESTNET session active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 md:block">
            <p className="text-[11px] text-muted-foreground">Wallet con la que te conectaste</p>
            <p className="font-mono text-xs text-foreground">
              {getShortAddress(publicKey)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
