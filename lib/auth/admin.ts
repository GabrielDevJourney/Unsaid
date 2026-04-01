import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if a user has the admin role.
 * Requires the authenticated server client (RLS applies — users cannot read other users' roles).
 * Set role = 'admin' in Supabase dashboard for admin users.
 */
export const isAdmin = async (
    userId: string,
    supabase: SupabaseClient,
): Promise<boolean> => {
    const { data: user } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", userId)
        .single();

    return user?.role === "admin";
};
