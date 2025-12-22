import type { SupabaseClient } from "@supabase/supabase-js";

export async function insertUser(
    supabase: SupabaseClient,
    user: {
        id: string;
        email: string;
        subscription_status: string;
    },
) {
    return supabase.from("users").insert({
        user_id: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
    });
}

export async function deleteUser(supabase: SupabaseClient, userId: string) {
    return supabase.from("users").delete().eq("user_id", userId);
}

export async function insertUserProgress(
    supabase: SupabaseClient,
    userId: string,
) {
    return supabase.from("user_progress").insert({
        user_id: userId,
        total_entries: 0,
    });
}
