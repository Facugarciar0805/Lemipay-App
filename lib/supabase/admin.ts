import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL?.trim() ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

/** Decode JWT payload without verification (only to read role). Avoids Buffer() deprecation. */
function getSupabaseKeyRole(key: string): string | null {
  try {
    const parts = key.split(".");
    if (parts.length < 2) return null;
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Server-only Supabase client with service role.
 * Use for auth.admin and wallet_profiles sync; never expose to the client.
 */
export function getSupabaseAdmin() {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env for wallet login sync.",
    );
  }
  const role = getSupabaseKeyRole(serviceRoleKey);
  if (role === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is set to the anon (public) key. Use the service_role secret instead: Supabase Dashboard → Project Settings → API → service_role (secret).",
    );
  }
  if (role !== "service_role") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY does not look like a service_role JWT. In Dashboard → Project Settings → API, copy the 'service_role' secret key.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
