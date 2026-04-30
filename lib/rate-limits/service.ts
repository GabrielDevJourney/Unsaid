import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceResult } from "@/types";
import { countRateLimitEventsSince, createRateLimitEvent } from "./repo";

export const RATE_LIMIT_ERROR = "rate_limit" as const;

export const RATE_LIMIT_SCOPES = {
    waitlistSignup: "waitlist_signup",
    onboardingPreview: "onboarding_preview",
    entryInsight: "entry_insight",
} as const;

const hashRateLimitKey = (key: string): string =>
    crypto.createHash("sha256").update(key).digest("hex");

/**
 * Atomically check and record a rate-limit event.
 *
 * IMPORTANT: must be called with a service-role Supabase client.
 * Authenticated-role clients cannot read rate_limit_events (RLS service_role
 * only). Calling with the wrong client silently returns 0 rows, meaning the
 * rate limit never triggers.
 *
 * Uses the try_consume_rate_limit DB function to eliminate the TOCTOU race
 * between count and insert.
 */
export const consumeRateLimit = async (
    supabase: SupabaseClient,
    scope: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
    key: string,
    windowMs: number,
    limit: number,
): Promise<ServiceResult<null>> => {
    const keyHash = hashRateLimitKey(key);
    const since = new Date(Date.now() - windowMs).toISOString();

    const { data: consumed, error } = await supabase.rpc(
        "try_consume_rate_limit",
        {
            p_scope: scope,
            p_key_hash: keyHash,
            p_since: since,
            p_limit: limit,
        },
    );

    if (error) {
        console.error("Rate limit check failed:", error);
        return { error: "Failed to check rate limit" };
    }

    if (!consumed) {
        return { error: RATE_LIMIT_ERROR };
    }

    return { data: null };
};

/**
 * Read-only rate-limit check — counts events without recording a new one.
 * Use this when you want to gate an operation but only record the event
 * after the operation succeeds (avoids consuming a token on transient failure).
 */
export const checkRateLimit = async (
    supabase: SupabaseClient,
    scope: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
    key: string,
    windowMs: number,
    limit: number,
): Promise<ServiceResult<null>> => {
    const keyHash = hashRateLimitKey(key);
    const since = new Date(Date.now() - windowMs).toISOString();

    const { count, error } = await countRateLimitEventsSince(
        supabase,
        scope,
        keyHash,
        since,
    );

    if (error) {
        console.error("Rate limit check failed:", error);
        return { error: "Failed to check rate limit" };
    }

    if ((count ?? 0) >= limit) {
        return { error: RATE_LIMIT_ERROR };
    }

    return { data: null };
};

/**
 * Record a rate-limit event after a successful operation.
 * Pair with checkRateLimit when you need check-then-act semantics.
 * Errors are logged but not surfaced — don't fail the caller on record failure.
 */
export const recordRateLimitUsage = async (
    supabase: SupabaseClient,
    scope: (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES],
    key: string,
): Promise<void> => {
    const keyHash = hashRateLimitKey(key);
    const { error } = await createRateLimitEvent(supabase, scope, keyHash);
    if (error) console.error("Rate limit event insert failed:", error);
};
