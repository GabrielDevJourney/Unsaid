import type { SupabaseClient } from "@supabase/supabase-js";
import type { InsertEntryInsightData } from "@/types";

/**
 * Insert a new entry insight into the database.
 * RLS will verify the user owns this entry.
 */
export const insertEntryInsight = async (
    supabase: SupabaseClient,
    data: InsertEntryInsightData,
) => {
    return supabase
        .from("entry_insights")
        .insert({
            user_id: data.userId,
            entry_id: data.entryId,
            content: data.content,
        })
        .select()
        .single();
};

/**
 * Get entry insight by entry ID.
 * Returns the insight associated with a specific entry.
 * RLS ensures user can only fetch their own entry insights.
 */
export const getEntryInsightByEntryId = async (
    supabase: SupabaseClient,
    entryId: string,
) => {
    return supabase
        .from("entry_insights")
        .select("id, user_id, entry_id, content, created_at, updated_at")
        .eq("entry_id", entryId)
        .single();
};
