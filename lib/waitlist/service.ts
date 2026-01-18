import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceResult, WaitlistSignupResult } from "@/types";
import { getWaitlistEntryByEmail, insertWaitlistEntry } from "./repo";

/**
 * Add email to the waitlist.
 * Returns success with message indicating new signup or existing entry.
 */
export const addToWaitlist = async (
    supabase: SupabaseClient,
    email: string,
    source: string,
): Promise<ServiceResult<WaitlistSignupResult>> => {
    const { error } = await insertWaitlistEntry(supabase, email, source);

    // Handle duplicate email (unique constraint violation)
    if (error?.code === "23505") {
        return {
            data: {
                message: "You're already on the waitlist!",
                isExisting: true,
            },
        };
    }

    if (error) {
        console.error("Failed to add to waitlist:", error);
        throw error;
    }

    return {
        data: {
            message: "You're on the list! We'll be in touch soon.",
            isExisting: false,
        },
    };
};

/**
 * Check if email is already on waitlist.
 * Note: email should be pre-normalized via schema validation.
 */
export const isOnWaitlist = async (
    supabase: SupabaseClient,
    email: string,
): Promise<boolean> => {
    const { data } = await getWaitlistEntryByEmail(supabase, email);
    return data !== null;
};
