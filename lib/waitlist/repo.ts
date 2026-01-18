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

/**
 * Get waitlist entry by email.
 */
export const getWaitlistEntryByEmail = async (
    supabase: SupabaseClient,
    email: string,
) => {
    return supabase
        .from("waitlist")
        .select("*")
        .eq("email", email)
        .single();
};
