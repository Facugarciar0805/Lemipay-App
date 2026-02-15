"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import freighterApi from "@stellar/freighter-api";
import Navbar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Footer from "@/components/landing/Footer";
import { STELLAR_TESTNET_NETWORK_PASSPHRASE } from "@/lib/auth/constants";

interface ChallengeResponse {
  challenge: string;
  expiresAt: number;
  networkPassphrase: string;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  publicKey: string;
  error?: string;
}

/** Normalize signMessage result to base64 string for the backend. */
function toBase64SignedMessage(
  signedMessage: Buffer | string | null,
): string {
  if (signedMessage == null) {
    throw new Error("Freighter no devolvió firma.");
  }
  if (typeof signedMessage === "string") {
    return signedMessage;
  }
  // Buffer (from @stellar/freighter-api)
  if (
    typeof signedMessage === "object" &&
    typeof (signedMessage as Buffer).toString === "function"
  ) {
    return (signedMessage as Buffer).toString("base64");
  }
  // Uint8Array / typed array (e.g. from extension)
  if (
    typeof signedMessage === "object" &&
    "length" in signedMessage &&
    typeof (signedMessage as Uint8Array).byteLength !== "undefined"
  ) {
    const bytes = new Uint8Array(signedMessage as ArrayBufferView);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  }
  throw new Error("Formato de firma no reconocido.");
}

export default function LandingHome() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (isConnecting) {
      return;
    }

    setAuthError(null);
    setIsConnecting(true);

    try {
      if (typeof window === "undefined") {
        throw new Error(
          "Freighter no detectado. Instalá la extensión en Chrome/Firefox/Brave y desbloqueá la wallet, luego recargá la página.",
        );
      }

      // requestAccess() abre el popup de Freighter y pide autorizar este sitio.
      // Sin esto, getAddress() puede devolver vacío y nunca se ve la extensión.
      const accessRes = await freighterApi.requestAccess();
      if (accessRes.error) {
        const msg = accessRes.error.message ?? "";
        if (msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("cancel")) {
          throw new Error("Cerraste Freighter sin autorizar. Intentá de nuevo cuando quieras conectar.");
        }
        throw new Error(
          accessRes.error.message ??
            "No se pudo conectar con Freighter. Desbloqueá la wallet e intentá de nuevo.",
        );
      }
      const publicKey = accessRes.address;
      if (!publicKey) {
        throw new Error(
          "No se obtuvo la dirección. En el popup de Freighter, elegí una cuenta y autorizá este sitio.",
        );
      }

      const challengeRes = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey }),
      });

      const challengeData = (await challengeRes.json()) as ChallengeResponse;
      if (!challengeRes.ok || !challengeData.challenge) {
        throw new Error(
          challengeData.error ?? "No se pudo obtener el desafío de autenticación.",
        );
      }

      const signResult = await freighterApi.signMessage(challengeData.challenge, {
        address: publicKey,
        networkPassphrase:
          challengeData.networkPassphrase ?? STELLAR_TESTNET_NETWORK_PASSPHRASE,
      });

      if (signResult.error) {
        throw new Error(
          signResult.error.message ?? "Freighter rechazó la firma o hubo un error.",
        );
      }
      if (signResult.signerAddress && signResult.signerAddress !== publicKey) {
        throw new Error("Freighter firmó con otra cuenta.");
      }

      const signedMessage = toBase64SignedMessage(signResult.signedMessage);
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signedMessage,
          challenge: challengeData.challenge,
        }),
      });

      const verifyData = (await verifyRes.json()) as VerifyResponse;
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(
          verifyData.error ?? "Falló la verificación de la firma de la wallet.",
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error inesperado al conectar la wallet.";
      setAuthError(message);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, router]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        walletConnected={false}
        isConnecting={isConnecting}
        onConnectWallet={connectWallet}
      />
      <main>
        <HeroSection
          walletConnected={false}
          isConnecting={isConnecting}
          onConnectWallet={connectWallet}
        />
        {authError ? (
          <section className="mx-auto max-w-5xl px-4 pb-4">
            <div className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{authError}</p>
              </div>
              {authError.includes("Freighter") ? (
                <a
                  href="https://www.freighterapp.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 text-primary underline hover:no-underline"
                >
                  Instalar Freighter →
                </a>
              ) : null}
            </div>
          </section>
        ) : null}
        <HowItWorks />
        <DashboardPreview walletConnected={false} />
      </main>
      <Footer />
    </div>
  );
}
