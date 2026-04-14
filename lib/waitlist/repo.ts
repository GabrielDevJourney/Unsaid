import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Insert a new waitlist entry.
 */
export const insertWaitlistEntry = async (
    supabase: SupabaseClient,
    email: string,
    source: string,
) => {
    return supabase
        .from("waitlist")
        .insert({
            email,
            source,
        })
        .select()
        .single();
};

export const getWaitlistCount = async (supabase: SupabaseClient) => {
    return supabase
        .from("waitlist")
        .select("id", { count: "exact", head: true });
};

/**
 * Get waitlist entry by email.
 */
export const getWaitlistEntryByEmail = async (
    supabase: SupabaseClient,
    email: string,
) => {
    return supabase.from("waitlist").select("*").eq("email", email).single();
};
