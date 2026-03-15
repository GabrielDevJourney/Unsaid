import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type {
    Entry,
    EntryMinimal,
    InsertProgressInsightData,
    ProgressInsight,
} from "@/types";
import { encrypt } from "../crypto";
import { toEntry, toEntryMinimal, toProgressInsight } from "./transformers";

/**
 * Count total progress insights for a user.
 * Used to compute milestone status at generation time.
 */
export const countProgressInsights = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<number> => {
    const { count } = await supabase
        .from("progress_insights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
    return count ?? 0;
};

/**
 * Insert a new progress insight into the database.
 * Encrypts content before storing.
 * Uses admin client to bypass RLS (insights are system-created).
 */
export const insertProgressInsight = async (
    supabase: SupabaseClient,
    data: InsertProgressInsightData,
): Promise<{ data: ProgressInsight | null; error: Error | null }> => {
    const { encryptedContent, iv, tag } = encrypt(data.content);

    const { data: insightRow, error } = await supabase
        .from("progress_insights")
        .insert({
            user_id: data.userId,
            encrypted_content: encryptedContent,
            content_iv: iv,
            content_tag: tag,
            recent_entry_ids: data.recentEntryIds,
            related_past_entry_ids: data.relatedPastEntryIds ?? [],
            key_entry_ids: data.keyEntryIds ?? null,
        })
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, is_viewed, recent_entry_ids, related_past_entry_ids, key_entry_ids, created_at, updated_at",
        )
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toProgressInsight(insightRow), error: null };
};

/**
 * Get the latest progress insight for a user.
 * Returns null if no progress insight exists.
 * Decrypts content before returning.
 */
export const getLatestProgressInsight = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ data: ProgressInsight | null; error: Error | null }> => {
    const { data: insightRow, error } = await supabase
        .from("progress_insights")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, is_viewed, recent_entry_ids, related_past_entry_ids, key_entry_ids, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toProgressInsight(insightRow), error: null };
};

/**
 * Get a progress insight by ID.
 * RLS ensures user can only fetch their own insights.
 * Decrypts content before returning.
 */
export const getProgressInsightById = async (
    supabase: SupabaseClient,
    insightId: string,
): Promise<{ data: ProgressInsight | null; error: Error | null }> => {
    const { data: insightRow, error } = await supabase
        .from("progress_insights")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, is_viewed, recent_entry_ids, related_past_entry_ids, key_entry_ids, created_at, updated_at",
        )
        .eq("id", insightId)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toProgressInsight(insightRow), error: null };
};

/**
 * Get all progress insights for a user (paginated).
 * Decrypts content for each result.
 */
export const getProgressInsightsPaginated = async (
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    pageSize = 10,
): Promise<{ data: ProgressInsight[]; error: Error | null; count: number }> => {
    const offset = (page - 1) * pageSize;

    const {
        data: insightRows,
        error,
        count,
    } = await supabase
        .from("progress_insights")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, is_viewed, recent_entry_ids, related_past_entry_ids, key_entry_ids, created_at, updated_at",
            { count: "exact" },
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error || !insightRows) {
        return { data: [], error, count: 0 };
    }

    return {
        data: insightRows.map(toProgressInsight),
        error: null,
        count: count ?? 0,
    };
};

/**
 * Count unviewed progress insights for the authenticated user.
 * RLS ensures only the user's own insights are counted.
 * Used to drive the sidebar notification badge.
 */
export const countUnviewedProgressInsights = async (
    supabase: SupabaseClient,
): Promise<{ count: number; error: PostgrestError | null }> => {
    const { count, error } = await supabase
        .from("progress_insights")
        .select("id", { count: "exact", head: true })
        .eq("is_viewed", false);
    return { count: count ?? 0, error };
};

/**
 * Mark a progress insight as viewed.
 * RLS ensures users can only update their own rows.
 */
export const markProgressInsightAsViewed = async (
    supabase: SupabaseClient,
    insightId: string,
): Promise<void> => {
    await supabase
        .from("progress_insights")
        .update({ is_viewed: true })
        .eq("id", insightId);
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
 * Decrypts content for each entry.
 */
export const getRecentEntries = async (
    supabase: SupabaseClient,
    userId: string,
    limit = 15,
): Promise<{ data: Entry[]; error: Error | null }> => {
    const { data: entryRows, error } = await supabase
        .from("entries")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !entryRows) {
        return { data: [], error };
    }

    return { data: entryRows.map(toEntry), error: null };
};

/**
 * Get entries older than a specific date (for finding related past entries).
 * Used to exclude recent entries when searching for related content.
 * Decrypts content for each entry.
 */
export const getEntriesBeforeDate = async (
    supabase: SupabaseClient,
    userId: string,
    beforeDate: string,
    limit = 50,
): Promise<{ data: EntryMinimal[]; error: Error | null }> => {
    const { data: entryRows, error } = await supabase
        .from("entries")
        .select("id, encrypted_content, content_iv, content_tag, created_at")
        .eq("user_id", userId)
        .lt("created_at", beforeDate)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !entryRows) {
        return { data: [], error };
    }

    return { data: entryRows.map(toEntryMinimal), error: null };
};
