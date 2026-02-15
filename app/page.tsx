"use client"

import { useWallet } from "@/context/wallet-context"
import { useLemipay } from "@/hooks/use-lemipay"

// Componentes de Lógica (v0)
import { GroupCard } from "@/components/lemipay/v0/group-card"
import { FundRoundProgress } from "@/components/lemipay/v0/fund-round-progress"
import { ProposalList } from "@/components/lemipay/v0/proposal-item"
import { MembersPanel } from "@/components/lemipay/v0/members-panel"
import { StatCards } from "@/components/lemipay/v0/stat-cards"

// Componentes de Estética (Lovable) - Asegúrate de que las rutas coincidan
import Navbar from "@/components/landing/NavBar"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorks from "@/components/landing/HowItWorks"
import DashboardPreview from "@/components/landing/DashboardPreview"
import Footer from "@/components/landing/Footer"

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
          <div className="grid gap-4 md:grid-cols-2">
            <GroupCard group={group} totalBalance={totalBalance} isLoading={isLoading} />
            <div className="flex flex-col gap-4">
              <StatCards fundRounds={fundRounds} proposals={proposals} isLoading={isLoading} />
              <MembersPanel group={group} isLoading={isLoading} />
            </div>
          </div>
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

function LandingPage() {
  const { connect, isConnected, isConnecting } = useWallet()

  return (
      <div className="min-h-screen bg-background">
        {/* Pasamos las funciones reales de la wallet a los componentes de Lovable */}
        <Navbar
            walletConnected={isConnected}
            onConnectWallet={connect}
        />
        <main>
          <HeroSection
              walletConnected={isConnected}
              onConnectWallet={connect}
          />
          <HowItWorks />
          <DashboardPreview walletConnected={isConnected} />
        </main>
        <Footer />
      </div>
  )
}

export default function Page() {
  const { isConnected } = useWallet()

  // Si está conectado, mostramos el Dashboard funcional.
  // Si no, mostramos la Landing espectacular de Lovable.
  return (
      <div className="min-h-screen bg-background">
        {isConnected ? (
            <>
              <Navbar walletConnected={true} onConnectWallet={() => {}} />
              <Dashboard />
            </>
        ) : (
            <LandingPage />
        )}
      </div>
  )
}