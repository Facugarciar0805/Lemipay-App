import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: "El email y el mensaje son obligatorios." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("feedback").insert({
      name: name?.trim() || null,
      email: email.trim().toLowerCase(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error al enviar el mensaje.";
    console.error("Feedback submit error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
