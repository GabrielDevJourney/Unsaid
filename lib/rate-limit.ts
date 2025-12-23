import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateLimitResult } from "@/types/domain/entries";

const ENTRY_LIMITS = {
    perMinute: 1,
    perDay: 20,
};

/**
 * Check if user can create a new entry based on rate limits.
 * Queries the entries table to count recent entries.
 */
export const checkEntryRateLimit = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<RateLimitResult> => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const todayStart = new Date(now.toISOString().split("T")[0]);

    // Check per-minute limit
    const { count: recentCount, error: recentError } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", oneMinuteAgo.toISOString());

    if (recentError) {
        console.error("Rate limit check failed (recent):", recentError);
        // Allow on error to not block users due to rate limit bugs
        return { allowed: true };
    }

    if ((recentCount ?? 0) >= ENTRY_LIMITS.perMinute) {
        return {
            allowed: false,
            reason: "Please wait a moment before writing another entry",
        };
    }

    // Check daily limit
    const { count: dailyCount, error: dailyError } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayStart.toISOString());

    if (dailyError) {
        console.error("Rate limit check failed (daily):", dailyError);
        return { allowed: true };
    }

    if ((dailyCount ?? 0) >= ENTRY_LIMITS.perDay) {
        return {
            allowed: false,
            reason: "Daily entry limit reached. Come back tomorrow!",
        };
    }

    return { allowed: true };
};
