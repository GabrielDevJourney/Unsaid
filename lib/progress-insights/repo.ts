import type { SupabaseClient } from "@supabase/supabase-js";
import type { InsertProgressInsightData } from "@/types";

/**
 * Insert a new progress insight into the database.
 * Uses admin client to bypass RLS (insights are system-created).
 */
export const insertProgressInsight = async (
    supabase: SupabaseClient,
    data: InsertProgressInsightData,
) => {
    return supabase
        .from("progress_insights")
        .insert({
            user_id: data.userId,
            content: data.content,
            recent_entry_ids: data.recentEntryIds,
            related_past_entry_ids: data.relatedPastEntryIds ?? [],
        })
        .select()
        .single();
};

/**
 * Get the latest progress insight for a user.
 * Returns null if no progress insight exists.
 */
export const getLatestProgressInsight = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase
        .from("progress_insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
};

/**
 * Get a progress insight by ID.
 * RLS ensures user can only fetch their own insights.
 */
export const getProgressInsightById = async (
    supabase: SupabaseClient,
    insightId: string,
) => {
    return supabase
        .from("progress_insights")
        .select("*")
        .eq("id", insightId)
        .single();
};

/**
 * Get all progress insights for a user (paginated).
 */
export const getProgressInsightsPaginated = async (
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    pageSize = 10,
) => {
    const offset = (page - 1) * pageSize;

    return supabase
        .from("progress_insights")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
};

/**
 * Get user progress tracking data.
 * Returns total entries and entry count at last progress insight.
 */
export const getUserProgress = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase
        .from("user_progress")
        .select(
            "user_id, total_entries, entry_count_at_last_progress, updated_at",
        )
        .eq("user_id", userId)
        .single();
};

/**
 * Update user progress after generating a progress insight.
 * Sets entry_count_at_last_progress to current total_entries.
 */
export const updateUserProgressAfterInsight = async (
    supabase: SupabaseClient,
    userId: string,
    currentTotalEntries: number,
) => {
    return supabase
        .from("user_progress")
        .update({ entry_count_at_last_progress: currentTotalEntries })
        .eq("user_id", userId)
        .select()
        .single();
};

/**
 * Get recent entries for a user (for progress insight generation).
 * Returns the most recent N entries ordered by creation date.
 */
export const getRecentEntries = async (
    supabase: SupabaseClient,
    userId: string,
    limit = 15,
) => {
    return supabase
        .from("entries")
        .select("id, user_id, content, word_count, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
};

/**
 * Get entries older than a specific date (for finding related past entries).
 * Used to exclude recent entries when searching for related content.
 */
export const getEntriesBeforeDate = async (
    supabase: SupabaseClient,
    userId: string,
    beforeDate: string,
    limit = 50,
) => {
    return supabase
        .from("entries")
        .select("id, content, created_at")
        .eq("user_id", userId)
        .lt("created_at", beforeDate)
        .order("created_at", { ascending: false })
        .limit(limit);
};
