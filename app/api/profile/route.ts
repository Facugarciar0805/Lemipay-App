import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, "El nombre no puede estar vacío"),
});

/** GET: returns current profile (displayName) for the session. Used to know if we should show the display-name modal after login. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ displayName: null }, { status: 200 });
    }

    const session = await verifySessionToken(token);
    if (!session?.publicKey) {
      return NextResponse.json({ displayName: null }, { status: 200 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ displayName: null }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("wallet_profiles")
      .select("display_name")
      .eq("wallet_address", session.publicKey)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ displayName: null }, { status: 200 });
    }

    const displayName =
      typeof data.display_name === "string" && data.display_name.trim()
        ? data.display_name.trim()
        : null;
    return NextResponse.json({ displayName }, { status: 200 });
  } catch {
    return NextResponse.json({ displayName: null }, { status: 200 });
  }
}

export async function PATCH(request: Request) {
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
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Perfil no disponible." },
        { status: 503 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("wallet_profiles")
      .update({
        display_name: parsed.data.displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", session.publicKey);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo actualizar el perfil." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el perfil." },
      { status: 500 },
    );
  }
}
