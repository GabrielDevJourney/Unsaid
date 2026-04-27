import type { SupabaseClient } from "@supabase/supabase-js";

export const countRateLimitEventsSince = (
    supabase: SupabaseClient,
    scope: string,
    keyHash: string,
    since: string,
) =>
    supabase
        .from("rate_limit_events")
        .select("id", { count: "exact", head: true })
        .eq("scope", scope)
        .eq("key_hash", keyHash)
        .gte("created_at", since);

export const insertRateLimitEvent = (
    supabase: SupabaseClient,
    scope: string,
    keyHash: string,
) =>
    supabase.from("rate_limit_events").insert({
        scope,
        key_hash: keyHash,
    });
