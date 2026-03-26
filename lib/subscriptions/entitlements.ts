import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns whether the authenticated user can write a new journal entry.
 * Active subscribers and users within a valid trial period are allowed.
 * Uses RLS — no userId needed.
 */
export const canUserWriteEntry = async (
    supabase: SupabaseClient,
): Promise<boolean> => {
    const { data, error } = await supabase
        .from("subscriptions")
        .select("status, trial_ends_at")
        .single();

    if (error || !data) return false;

    if (data.status === "active") return true;

    if (data.status === "trial" && data.trial_ends_at) {
        return new Date(data.trial_ends_at) > new Date();
    }

    return false;
};
