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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChallengeResponse {
  challenge: string;
  expiresAt: number;
  networkPassphrase: string;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  publicKey: string;
  displayName?: string | null;
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
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

      // Use displayName from verify response (server already read from Supabase)
      const hasDisplayName =
        typeof verifyData.displayName === "string" &&
        verifyData.displayName.trim().length > 0;

      if (hasDisplayName) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setShowDisplayNameModal(true);
      }
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

  const handleDisplayNameSubmit = useCallback(async () => {
    const name = displayName.trim();
    if (!name) {
      setDisplayNameError("Escribí un nombre para continuar.");
      return;
    }
    setDisplayNameError(null);
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setDisplayNameError(data.error ?? "No se pudo guardar. Intentá de nuevo.");
        return;
      }
      setShowDisplayNameModal(false);
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setDisplayNameError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsSavingProfile(false);
    }
  }, [displayName, router]);

  const handleSkipDisplayName = useCallback(() => {
    setShowDisplayNameModal(false);
    router.replace("/dashboard");
    router.refresh();
  }, [router]);

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
      <Dialog
        open={showDisplayNameModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowDisplayNameModal(false);
            router.replace("/dashboard");
            router.refresh();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cómo te llamamos?</DialogTitle>
            <DialogDescription>
              Este nombre se mostrará en tu perfil y en los grupos. Podés cambiarlo después.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Nombre para mostrar</Label>
              <Input
                id="display-name"
                placeholder="Ej: María, Juan..."
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setDisplayNameError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleDisplayNameSubmit()}
                disabled={isSavingProfile}
                autoFocus
              />
              {displayNameError ? (
                <p className="text-sm text-destructive">{displayNameError}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipDisplayName}
              disabled={isSavingProfile}
            >
              Omitir
            </Button>
            <Button
              type="button"
              onClick={handleDisplayNameSubmit}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? "Guardando…" : "Continuar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
