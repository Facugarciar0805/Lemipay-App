import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingHome from "@/components/landing/landing-home";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (sessionToken) {
    const session = await verifySessionToken(sessionToken);
    if (session?.publicKey) {
      redirect("/dashboard");
    }
  }

  return <LandingHome />;
}