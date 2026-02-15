"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { ProfileView } from "@/components/lemipay/profile-view"
import { GroupDashboard } from "@/components/lemipay/group-dashboard"
import Navbar from "@/components/landing/NavBar"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorks from "@/components/landing/HowItWorks"
import DashboardPreview from "@/components/landing/DashboardPreview"
import Footer from "@/components/landing/Footer"

export default function Page() {
    const { isConnected, address, connect, disconnect } = useWallet()
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

    // ESTADO 1: No conectado (Landing)
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar walletConnected={false} onConnectWallet={connect} />
                <main>
                    <HeroSection walletConnected={false} onConnectWallet={connect} />
                    <HowItWorks />
                    <DashboardPreview walletConnected={false} />
                </main>
                <Footer />
            </div>
        )
    }

    // ESTADO 2: Conectado pero en Perfil (Selección de grupo)
    if (!selectedGroupId) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar walletConnected={true} onConnectWallet={() => {}} />
                <ProfileView
                    address={address || ""}
                    onSelectGroup={(id) => setSelectedGroupId(id)}
                    onDisconnect={disconnect}
                />
                <Footer />
            </div>
        )
    }

    // ESTADO 3: Dentro de un grupo específico (Dashboard de v0)
    return (
        <div className="min-h-screen bg-background">
            <Navbar walletConnected={true} onConnectWallet={() => {}} />
            <GroupDashboard
                address={address || ""}
                onBack={() => setSelectedGroupId(null)}
            />
            <Footer />
        </div>
    )
}