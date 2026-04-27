import type { SupabaseClient } from "@supabase/supabase-js";
import {
    consumeRateLimit,
    RATE_LIMIT_ERROR,
    RATE_LIMIT_SCOPES,
} from "@/lib/rate-limits/service";
import type { ServiceResult, WaitlistSignupResult } from "@/types";
import {
    getWaitlistCount,
    getWaitlistEntryByEmail,
    insertWaitlistEntry,
} from "./repo";

const WAITLIST_RATE_LIMIT_MS = 60 * 60 * 1000;

export const addToWaitlist = async (
    supabase: SupabaseClient,
    email: string,
    source: string,
    ipAddress: string,
): Promise<ServiceResult<WaitlistSignupResult>> => {
    const rateLimit = await consumeRateLimit(
        supabase,
        RATE_LIMIT_SCOPES.waitlistSignup,
        ipAddress,
        WAITLIST_RATE_LIMIT_MS,
        1,
    );

    if (rateLimit.error === RATE_LIMIT_ERROR) {
        return { error: RATE_LIMIT_ERROR };
    }

    if (rateLimit.error) {
        return { error: "Failed to check waitlist rate limit" };
    }

    const { error } = await insertWaitlistEntry(supabase, email, source);

    if (error?.code === "23505") {
        return {
            data: {
                message: "You're already on the waitlist!",
                isExisting: true,
                position: null,
            },
        };
    }

    if (error) {
        console.error("Failed to add to waitlist:", error);
        return { error: "Failed to add to waitlist" };
    }

    const { count, error: countError } = await getWaitlistCount(supabase);

    if (countError) {
        console.error("Failed to count waitlist entries:", countError);
        return { error: "Failed to get waitlist position" };
    }

    return {
        data: {
            message: "You're on the list! We'll be in touch soon.",
            isExisting: false,
            position: count ?? null,
        },
    };
};

export const isOnWaitlist = async (
    supabase: SupabaseClient,
    email: string,
): Promise<boolean> => {
    const { data } = await getWaitlistEntryByEmail(supabase, email);
    return data !== null;
};
