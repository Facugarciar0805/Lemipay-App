import { randomBytes } from "node:crypto";
import {
  CHALLENGE_TTL_MS,
  STELLAR_TESTNET_NETWORK_PASSPHRASE,
} from "@/lib/auth/constants";

export interface ChallengeRecord {
  challenge: string;
  createdAt: number;
  expiresAt: number;
  networkPassphrase: string;
}

// Single in-process store so challenge and verify share the same Map (survives hot reload in dev).
declare global {
  // eslint-disable-next-line no-var
  var __lemipay_challenge_store: Map<string, ChallengeRecord> | undefined;
}
const challengesByPublicKey =
  typeof globalThis !== "undefined" && globalThis.__lemipay_challenge_store
    ? globalThis.__lemipay_challenge_store
    : (() => {
        const store = new Map<string, ChallengeRecord>();
        if (typeof globalThis !== "undefined") {
          globalThis.__lemipay_challenge_store = store;
        }
        return store;
      })();

function pruneExpiredChallenges(now = Date.now()): void {
  for (const [publicKey, record] of challengesByPublicKey.entries()) {
    if (record.expiresAt <= now) {
      challengesByPublicKey.delete(publicKey);
    }
  }
}

export function issueChallenge(publicKey: string): ChallengeRecord {
  const now = Date.now();
  const timestamp = new Date(now).toISOString();
  const nonce = randomBytes(32).toString("hex");

  // The signed payload contains public key, timestamp and passphrase context.
  const challenge = [
    "lemipay-sep10",
    `publicKey=${publicKey}`,
    `timestamp=${timestamp}`,
    `nonce=${nonce}`,
    `networkPassphrase=${STELLAR_TESTNET_NETWORK_PASSPHRASE}`,
  ].join("|");

  const record: ChallengeRecord = {
    challenge,
    createdAt: now,
    expiresAt: now + CHALLENGE_TTL_MS,
    networkPassphrase: STELLAR_TESTNET_NETWORK_PASSPHRASE,
  };

  pruneExpiredChallenges(now);
  challengesByPublicKey.set(publicKey, record);

  return record;
}

export function getChallenge(publicKey: string): ChallengeRecord | null {
  const record = challengesByPublicKey.get(publicKey);
  if (!record) {
    return null;
  }

  if (record.expiresAt <= Date.now()) {
    challengesByPublicKey.delete(publicKey);
    return null;
  }

  return record;
}

export function deleteChallenge(publicKey: string): void {
  challengesByPublicKey.delete(publicKey);
}
