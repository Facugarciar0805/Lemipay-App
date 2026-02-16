import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { z } from "zod";
import {
  deleteChallenge,
  getChallenge,
} from "@/lib/auth/challenge-store";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  SIGNED_MESSAGE_PREFIX,
  STELLAR_TESTNET_NETWORK_PASSPHRASE,
} from "@/lib/auth/constants";
import { signSessionToken } from "@/lib/auth/jwt";
import { syncWalletProfile } from "@/lib/supabase/sync-wallet-profile";

export const runtime = "nodejs";

const verifyRequestSchema = z.object({
  publicKey: z.string().trim().min(1),
  signedMessage: z.string().trim().min(1),
  challenge: z.string().trim().min(1),
  displayName: z.string().trim().optional(),
});

/**
 * Freighter signMessage signs: SHA256("Stellar Signed Message:\n" + message).
 * We verify the signature against that hash first, then fallback to raw message.
 */
function verifyChallengeSignature(
  publicKey: string,
  challenge: string,
  signedMessageBase64: string,
): boolean {
  const keypair = Keypair.fromPublicKey(publicKey);
  let signatureBuffer: Buffer;
  try {
    signatureBuffer = Buffer.from(signedMessageBase64, "base64");
  } catch {
    return false;
  }
  if (signatureBuffer.length === 0) {
    return false;
  }

  const tryVerify = (data: Buffer): boolean => {
    try {
      return keypair.verify(data, signatureBuffer);
    } catch {
      return false;
    }
  };

  // 1) Freighter standard: sign(SHA256("Stellar Signed Message:\n" + message))
  const prefixedMessageHash = createHash("sha256")
    .update(`${SIGNED_MESSAGE_PREFIX}${challenge}`)
    .digest();
  if (tryVerify(prefixedMessageHash)) {
    return true;
  }

  // 2) Fallback: raw challenge bytes (some clients sign the message directly)
  if (tryVerify(Buffer.from(challenge, "utf8"))) {
    return true;
  }

  return false;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsedBody = verifyRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const { publicKey, signedMessage, challenge, displayName } = parsedBody.data;

    try {
      Keypair.fromPublicKey(publicKey);
    } catch {
      return NextResponse.json(
        { error: "Invalid Stellar public key." },
        { status: 400 },
      );
    }

    const storedChallenge = getChallenge(publicKey);
    if (!storedChallenge) {
      return NextResponse.json(
        { error: "Challenge missing or expired. Request a new one." },
        { status: 401 },
      );
    }

    if (storedChallenge.challenge !== challenge) {
      return NextResponse.json(
        { error: "Challenge does not match." },
        { status: 401 },
      );
    }

    if (
      !challenge.includes(
        `networkPassphrase=${STELLAR_TESTNET_NETWORK_PASSPHRASE}`,
      )
    ) {
      return NextResponse.json(
        { error: "Network passphrase mismatch in challenge." },
        { status: 401 },
      );
    }

    const isValid = verifyChallengeSignature(publicKey, challenge, signedMessage);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid wallet signature." },
        { status: 401 },
      );
    }

    // Single-use: consume challenge only after successful verification.
    deleteChallenge(publicKey);

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await syncWalletProfile(publicKey, displayName ?? null);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error("[auth/verify] Supabase sync:", err);
        }
        return NextResponse.json(
          { error: "Failed to sync wallet profile. Try again." },
          { status: 500 },
        );
      }
    }

    const sessionToken = await signSessionToken(publicKey);
    const response = NextResponse.json({ success: true, publicKey });

    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[auth/verify]", err);
    }
    return NextResponse.json(
      { error: "Failed to verify authentication signature." },
      { status: 500 },
    );
  }
}
