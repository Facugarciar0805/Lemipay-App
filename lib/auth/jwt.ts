import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { AUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/auth/constants";

const JWT_ALGORITHM = "HS256";

export interface SessionPayload extends JWTPayload {
  publicKey: string;
}

/** Dev-only fallback so login works without .env when NODE_ENV=development. */
const DEV_JWT_SECRET = process.env.JWT_SECRET;

function getJwtSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;

  if (jwtSecret && jwtSecret.length >= 32) {
    return new TextEncoder().encode(jwtSecret);
  }

  if (process.env.NODE_ENV === "development") {
    if (!jwtSecret || jwtSecret.length < 32) {
      console.warn(
        "[auth] JWT_SECRET not set or too short. Using dev secret. Set JWT_SECRET in .env.local for production.",
      );
    }
    return new TextEncoder().encode(DEV_JWT_SECRET);
  }

  throw new Error(
    "JWT_SECRET must be set in .env and be at least 32 characters long.",
  );
}

export async function signSessionToken(publicKey: string): Promise<string> {
  return new SignJWT({ publicKey })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_COOKIE_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    });

    if (typeof payload.publicKey !== "string" || payload.publicKey.length === 0) {
      return null;
    }

    return payload as SessionPayload;
  } catch {
    return null;
  }
}
