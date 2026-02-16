import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET /api/profiles?wallets=addr1,addr2,addr3
 * Returns display_name from wallet_profiles for each wallet. Used for member lists.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletsParam = searchParams.get("wallets");
    if (!walletsParam || !walletsParam.trim()) {
      return NextResponse.json({ profiles: {} }, { status: 200 });
    }

    const addresses = walletsParam
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (addresses.length === 0) {
      return NextResponse.json({ profiles: {} }, { status: 200 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ profiles: {} }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from("wallet_profiles")
      .select("wallet_address, display_name")
      .in("wallet_address", addresses);

    if (error) {
      return NextResponse.json({ profiles: {} }, { status: 200 });
    }

    const profiles: Record<string, string | null> = {};
    for (const addr of addresses) {
      profiles[addr] = null;
    }
    for (const row of rows ?? []) {
      const name =
        typeof row.display_name === "string" && row.display_name.trim()
          ? row.display_name.trim()
          : null;
      profiles[row.wallet_address] = name;
    }

    return NextResponse.json({ profiles }, { status: 200 });
  } catch {
    return NextResponse.json({ profiles: {} }, { status: 200 });
  }
}
