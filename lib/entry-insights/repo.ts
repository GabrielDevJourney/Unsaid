import type { SupabaseClient } from "@supabase/supabase-js";
import type { InsertEntryInsightData } from "@/types/domain/insights";

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
 * Get a single entry insight by ID.
 * RLS ensures user can only fetch their own entries.
 */
export const getEntryInsightById = async (
    supabase: SupabaseClient,
    entryInsightId: string,
) => {
    return supabase
        .from("entry_insights")
        .select("id, user_id, entry_id,content, created_at, updated_at")
        .eq("id", entryInsightId)
        .single();
};
