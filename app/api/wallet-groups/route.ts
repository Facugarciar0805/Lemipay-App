import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { linkWalletToGroup } from "@/lib/supabase/wallet-groups";

export const runtime = "nodejs";

const bodySchema = z.object({
  groupId: z.union([z.string(), z.number()]),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session?.publicKey) {
      return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "groupId es requerido." },
        { status: 400 }
      );
    }

    const groupId =
      typeof parsed.data.groupId === "string"
        ? BigInt(parsed.data.groupId)
        : BigInt(parsed.data.groupId);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: true });
    }

    await linkWalletToGroup(session.publicKey, groupId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo vincular el grupo." },
      { status: 500 }
    );
  }
}
