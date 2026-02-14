"use client"

import { useWallet } from "@/context/wallet-context"
import { useLemipay } from "@/hooks/use-lemipay"
import { Navbar } from "@/components/lemipay/navbar"
import { GroupCard } from "@/components/lemipay/group-card"
import { FundRoundProgress } from "@/components/lemipay/fund-round-progress"
import { ProposalList } from "@/components/lemipay/proposal-item"
import { MembersPanel } from "@/components/lemipay/members-panel"
import { StatCards } from "@/components/lemipay/stat-cards"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowRight, Shield, Users, Zap } from "lucide-react"

function ConnectPrompt() {
  const { connect, isConnecting } = useWallet()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            <Image
              src="/images/lemipay-logo.jpeg"
              alt="Lemipay logo"
              width={80}
              height={80}
              className="relative rounded-2xl"
            />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground text-balance">
          Gestion de tesoreria grupal
        </h1>
        <p className="mb-8 text-muted-foreground leading-relaxed text-balance">
          Administra fondos compartidos con total transparencia.
          Rondas de fondeo, propuestas de pago y firmas multiples.
        </p>

        <Button
          size="lg"
          onClick={connect}
          disabled={isConnecting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        >
          {isConnecting ? "Conectando..." : "Conectar Wallet"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              Fondos grupales
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              Multi-firma
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              Transparente
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { address } = useWallet()
  const {
    group,
    fundRounds,
    proposals,
    isLoading,
    totalBalance,
    contribute,
    approveProposal,
    executeRelease,
    isSubmitting,
  } = useLemipay(address)

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Top: Balance + Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <GroupCard
            group={group}
            totalBalance={totalBalance}
            isLoading={isLoading}
          />
          <div className="flex flex-col gap-4">
            <StatCards
              fundRounds={fundRounds}
              proposals={proposals}
              isLoading={isLoading}
            />
            <MembersPanel group={group} isLoading={isLoading} />
          </div>
        </div>

        {/* Bottom: Rounds + Proposals */}
        <div className="grid gap-4 md:grid-cols-2">
          <FundRoundProgress
            rounds={fundRounds}
            isLoading={isLoading}
            onContribute={contribute}
            isSubmitting={isSubmitting}
          />
          <ProposalList
            proposals={proposals}
            group={group}
            isLoading={isLoading}
            onApprove={approveProposal}
            onExecute={executeRelease}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </main>
  )
}

export default function Page() {
  const { isConnected } = useWallet()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isConnected ? <Dashboard /> : <ConnectPrompt />}
    </div>
  )
}
