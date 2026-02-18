import type { SupabaseClient } from "@supabase/supabase-js";

export const insertUser = async (
    supabase: SupabaseClient,
    user: {
        id: string;
        email: string;
        username: string;
        subscription_status: string;
    },
) => {
    return supabase.from("users").insert({
        user_id: user.id,
        email: user.email,
        username: user.username,
        subscription_status: user.subscription_status,
    });
};

export const deleteUser = async (supabase: SupabaseClient, userId: string) => {
    return supabase.from("users").delete().eq("user_id", userId);
};

export const insertUserProgress = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase.from("user_progress").insert({
        user_id: userId,
        total_entries: 0,
    });
};

/**
 * Get user progress stats.
 * RLS ensures only the authenticated user's row is returned.
 */
export const getUserProgress = async (
    supabase: SupabaseClient,
): Promise<{ data: { totalEntries: number } | null; error: Error | null }> => {
    const { data, error } = await supabase
        .from("user_progress")
        .select("total_entries")
        .single();

    if (error || !data) {
        return { data: null, error };
    }

    return { data: { totalEntries: data.total_entries }, error: null };
};
