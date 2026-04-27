import type { SupabaseClient } from "@supabase/supabase-js";

export const createWaitlistEntry = async (
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

export const countWaitlistEntries = async (supabase: SupabaseClient) => {
    return supabase
        .from("waitlist")
        .select("id", { count: "exact", head: true });
};

export const findWaitlistEntryByEmail = async (
    supabase: SupabaseClient,
    email: string,
) => {
    return supabase.from("waitlist").select("*").eq("email", email).single();
};
