import { getSupabaseAdmin } from "./admin";

/**
 * Vincula una wallet a un grupo específico en la tabla wallet_groups.
 * Útil cuando un usuario crea un grupo o se une a uno existente.
 */
export async function linkWalletToGroup(
    walletAddress: string,
    groupId: number | bigint
): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("wallet_groups").upsert(
        {
            wallet_address: walletAddress,
            group_id: groupId,
            created_at: new Date().toISOString(),
        },
        {
            // Evitamos duplicados si el usuario ya pertenece al grupo
            onConflict: "wallet_address,group_id",
        }
    );

    if (error) {
        throw new Error(`Supabase linkWalletToGroup error: ${error.message}`);
    }
}

/**
 * Recupera todos los IDs de los grupos a los que pertenece una wallet.
 * Esta es la función que usarás para listar los grupos en el perfil del usuario.
 */
export async function getWalletGroups(
    walletAddress: string
): Promise<number[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("wallet_groups")
        .select("group_id")
        .eq("wallet_address", walletAddress);

    if (error) {
        throw new Error(`Supabase getWalletGroups error: ${error.message}`);
    }

    // Retornamos un array simple de números para facilitar el uso en el frontend
    return data?.map((row) => Number(row.group_id)) || [];
}