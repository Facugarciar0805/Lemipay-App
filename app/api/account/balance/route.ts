import { NextResponse } from "next/server";
import { STELLAR_CONFIG } from "@/lib/stellar-client";

export const runtime = "nodejs";

/** USDC asset code on Stellar. We accept any issuer for testnet. */
const USDC_ASSET_CODE = "USDC";

interface HorizonBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

interface HorizonAccountResponse {
  balances: HorizonBalance[];
}

/**
 * GET /api/account/balance?address=G...
 * Returns { usdc: string } - formatted USDC balance for the account (e.g. "1,234.56").
 * If account has no USDC trustline or fetch fails, returns "0.00".
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json(
      { error: "Missing address query parameter." },
      { status: 400 },
    );
  }

  // Basic Stellar address format (G or C, 56 chars)
  if (!/^[GC][A-Z2-7]{55}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid Stellar address." },
      { status: 400 },
    );
  }

  try {
    const url = `${STELLAR_CONFIG.horizonUrl}/accounts/${address}`;
    const res = await fetch(url, { next: { revalidate: 30 } });

    if (res.status === 404) {
      return NextResponse.json({ usdc: "0.00" });
    }

    if (!res.ok) {
      console.error("[account/balance] Horizon error:", res.status, await res.text());
      return NextResponse.json({ usdc: "0.00" });
    }

    const data = (await res.json()) as HorizonAccountResponse;
    const usdcBalance = data.balances?.find(
      (b) =>
        b.asset_type === "credit_alphanum4" &&
        b.asset_code === USDC_ASSET_CODE,
    );

    if (!usdcBalance?.balance) {
      return NextResponse.json({ usdc: "0.00" });
    }

    const raw = parseFloat(usdcBalance.balance);
    const formatted = Number.isNaN(raw) ? "0.00" : raw.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return NextResponse.json({ usdc: formatted });
  } catch (err) {
    console.error("[account/balance]", err);
    return NextResponse.json({ usdc: "0.00" });
  }
}
