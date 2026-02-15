import { NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { z } from "zod";
import { issueChallenge } from "@/lib/auth/challenge-store";

export const runtime = "nodejs";

const challengeRequestSchema = z.object({
  publicKey: z.string().trim().min(1),
});

function isValidStellarPublicKey(publicKey: string): boolean {
  try {
    Keypair.fromPublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsedBody = challengeRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const publicKey = parsedBody.data.publicKey;
    if (!isValidStellarPublicKey(publicKey)) {
      return NextResponse.json(
        { error: "Invalid Stellar public key." },
        { status: 400 },
      );
    }

    const challengeRecord = issueChallenge(publicKey);

    return NextResponse.json({
      challenge: challengeRecord.challenge,
      expiresAt: challengeRecord.expiresAt,
      networkPassphrase: challengeRecord.networkPassphrase,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate authentication challenge." },
      { status: 500 },
    );
  }
}
