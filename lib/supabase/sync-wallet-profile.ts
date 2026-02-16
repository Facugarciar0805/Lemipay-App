import { getSupabaseAdmin } from "./admin";

const WALLET_EMAIL_DOMAIN = "wallet.lemipay.local";

function walletEmail(publicKey: string): string {
  return `${publicKey}@${WALLET_EMAIL_DOMAIN}`;
}

/**
 * Ensures a Supabase Auth user and a wallet_profiles row exist for this wallet.
 * Call after successful signature verification in /api/auth/verify.
 */
export async function syncWalletProfile(
  walletAddress: string,
  displayName?: string | null,
): Promise<{ userId: string }> {
  const supabase = getSupabaseAdmin();
  const email = walletEmail(walletAddress);
  const randomPassword = crypto.randomUUID() + crypto.randomUUID();

  // 1) Try to create Auth user (same email = same user for this wallet)
  const { data: createData, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
    });

  let userId: string;

  if (createError) {
    const msg = createError.message ?? "";
    if (
      msg.includes("already been registered") ||
      msg.includes("already exists") ||
      createError.status === 422
    ) {
      // User exists: get user_id from wallet_profiles (we already have a row from a previous login)
      const { data: profileRow } = await supabase
        .from("wallet_profiles")
        .select("user_id")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      if (profileRow?.user_id) {
        userId = profileRow.user_id;
      } else {
        // Fallback: find by listing (paginate in case there are many users)
        let page = 1;
        const perPage = 500;
        let found: { id: string } | null = null;
        while (true) {
          const { data: listData, error: listError } =
            await supabase.auth.admin.listUsers({ page, perPage });
          if (listError) {
            throw new Error(`Supabase listUsers: ${listError.message}`);
          }
          const existing = listData.users.find((u) => u.email === email);
          if (existing) {
            found = { id: existing.id };
            break;
          }
          if (listData.users.length < perPage) break;
          page++;
        }
        if (!found) {
          throw new Error(
            `Supabase: user with email ${email} not found after create conflict.`,
          );
        }
        userId = found.id;
      }
    } else {
      const msg = createError.message ?? "";
      if (msg.includes("Bearer token") || msg.includes("valid Bearer")) {
        throw new Error(
          "Supabase Auth admin requires the service_role key. In Supabase Dashboard go to Project Settings → API and use the 'service_role' secret (not the anon key). Set SUPABASE_SERVICE_ROLE_KEY in .env.",
        );
      }
      throw new Error(`Supabase createUser: ${msg}`);
    }
  } else if (createData?.user?.id) {
    userId = createData.user.id;
  } else {
    throw new Error("Supabase createUser returned no user id.");
  }

  // 2) Upsert wallet_profiles (one row per wallet_address)
  const { error: upsertError } = await supabase.from("wallet_profiles").upsert(
    {
      user_id: userId,
      wallet_address: walletAddress,
      display_name: displayName ?? null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "wallet_address",
    },
  );

  if (upsertError) {
    throw new Error(`Supabase wallet_profiles upsert: ${upsertError.message}`);
  }

  return { userId };
}
