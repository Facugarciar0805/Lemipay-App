"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/context/wallet-context"
import { Loader2, LogOut, Wifi } from "lucide-react"

export function Navbar() {
  const { isConnected, isConnecting, connect, disconnect, shortAddress } =
    useWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/lemipay-logo.jpeg"
            alt="Lemipay logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground tracking-tight">
              Lemipay
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-primary/30 text-primary hidden sm:inline-flex"
            >
              Testnet
            </Badge>
          </div>
        </div>

        {/* Wallet connection */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-3 py-1.5">
                <Wifi className="h-3 w-3 text-success" />
                <span className="text-xs font-mono text-muted-foreground">
                  {shortAddress}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnect}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Desconectar wallet</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={connect}
              disabled={isConnecting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                "Conectar Wallet"
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
