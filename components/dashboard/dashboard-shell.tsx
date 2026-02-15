"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { ProfileView } from "@/components/lemipay/profile-view";
import { GroupDashboard } from "@/components/lemipay/group-dashboard";
import Footer from "@/components/landing/Footer";

interface DashboardShellProps {
  publicKey: string;
}

export function DashboardShell({ publicKey }: DashboardShellProps) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to clear session cookie.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to logout cleanly.";
      setLogoutError(message);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar
        publicKey={publicKey}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main>
        {logoutError ? (
          <section className="mx-auto max-w-5xl px-4 pt-4">
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{logoutError}</p>
            </div>
          </section>
        ) : null}

        {!selectedGroupId ? (
          <ProfileView
            address={publicKey}
            onSelectGroup={(groupId) => setSelectedGroupId(groupId)}
            onDisconnect={handleLogout}
          />
        ) : (
          <GroupDashboard
            address={publicKey}
            onBack={() => setSelectedGroupId(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
