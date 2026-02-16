import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    try {
        const { groupId, members } = await request.json();
        const supabase = getSupabaseAdmin();

        // Insertamos una fila por cada miembro del grupo
        const rows = members.map((address: string) => ({
            wallet_address: address,
            group_id: groupId,
            created_at: new Date().toISOString(),
        }));

        const { error } = await supabase
            .from("wallet_groups")
            .upsert(rows, { onConflict: "wallet_address,group_id" });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Link Group Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}