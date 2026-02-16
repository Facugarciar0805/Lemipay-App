import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { linkWalletsToGroup } from "@/lib/supabase/wallet-groups";

export const runtime = "nodejs";

const STELLAR_ADDRESS_REGEX = /^[GC][A-Z2-7]{55}$/;

const bodySchema = z.object({
  groupId: z.union([z.string(), z.number()]),
  members: z
    .array(z.string().trim().regex(STELLAR_ADDRESS_REGEX))
    .min(1, "Al menos un miembro"),
});

/**
 * POST /api/groups/sync-members
 * Guarda en wallet_groups cada wallet asociada al group_id (tras crear el grupo on-chain).
 * Requiere sesión. Body: { groupId, members: string[] }
 */
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
        { error: "groupId y members (array de direcciones) son requeridos." },
        { status: 400 }
      );
    }

    const groupId =
      typeof parsed.data.groupId === "string"
        ? BigInt(parsed.data.groupId)
        : BigInt(parsed.data.groupId);
    const members = parsed.data.members;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: true });
    }

    await linkWalletsToGroup(groupId, members);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[groups/sync-members]", err);
    return NextResponse.json(
      { error: "No se pudieron guardar los miembros del grupo." },
      { status: 500 }
    );
  }
}
