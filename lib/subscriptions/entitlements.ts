import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_TRIAL_ENTRIES } from "@/lib/constants";

/**
 * Returns whether the authenticated user can write a new journal entry.
 * Active subscribers are always allowed. Trial users are allowed until they
 * reach FREE_TRIAL_ENTRIES. Uses RLS — no userId needed.
 */
export const canUserWriteEntry = async (
    supabase: SupabaseClient,
): Promise<boolean> => {
    const { data, error } = await supabase
        .from("subscriptions")
        .select("status")
        .single();

    if (error || !data) return false;

    if (data.status === "active") return true;

    if (data.status === "trial") {
        const { count } = await supabase
            .from("entries")
            .select("id", { count: "exact", head: true });
        return (count ?? 0) < FREE_TRIAL_ENTRIES;
    }

    return false;
};
