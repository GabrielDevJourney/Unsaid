import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceResult } from "@/types";
import { countRateLimitEventsSince, insertRateLimitEvent } from "./repo";

export const RATE_LIMIT_ERROR = "rate_limit" as const;

export const RATE_LIMIT_SCOPES = {
    waitlistSignup: "waitlist_signup",
} as const;

const hashRateLimitKey = (key: string): string =>
    crypto.createHash("sha256").update(key).digest("hex");

export const consumeRateLimit = async (
    supabase: SupabaseClient,
    scope: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
    key: string,
    windowMs: number,
    limit: number,
): Promise<ServiceResult<null>> => {
    const keyHash = hashRateLimitKey(key);
    const since = new Date(Date.now() - windowMs).toISOString();

    const { count, error: countError } = await countRateLimitEventsSince(
        supabase,
        scope,
        keyHash,
        since,
    );

    if (countError) {
        console.error("Rate limit check failed:", countError);
        return { error: "Failed to check rate limit" };
    }

    if ((count ?? 0) >= limit) {
        return { error: RATE_LIMIT_ERROR };
    }

    const { error: insertError } = await insertRateLimitEvent(
        supabase,
        scope,
        keyHash,
    );

    if (insertError) {
        console.error("Rate limit event insert failed:", insertError);
        return { error: "Failed to update rate limit" };
    }

    return { data: null };
};
