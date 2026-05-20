import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateLimitResult } from "@/types";

const ENTRY_LIMITS = {
    perDay: 20,
};

/**
 * Check if user can create a new entry based on rate limits.
 * Queries the entries table to count entries created today.
 */
export const checkEntryRateLimit = async (
    supabase: SupabaseClient,
    _userId: string,
): Promise<RateLimitResult> => {
    const todayStart = new Date(new Date().toISOString().split("T")[0]);

    const { count: dailyCount, error: dailyError } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

    if (dailyError) {
        console.error("Rate limit check failed (daily):", dailyError);
        return { allowed: true };
    }

    if ((dailyCount ?? 0) >= ENTRY_LIMITS.perDay) {
        return { allowed: false };
    }

    return { allowed: true };
};
