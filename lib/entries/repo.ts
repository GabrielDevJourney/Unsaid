import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntryWithSimilarity, InsertEntryData } from "@/types";

/**
 * Insert a new entry into the database.
 * RLS will verify the user owns this entry.
 */
export const insertEntry = async (
    supabase: SupabaseClient,
    data: InsertEntryData,
) => {
    return supabase
        .from("entries")
        .insert({
            user_id: data.userId,
            content: data.content,
            word_count: data.wordCount,
        })
        .select()
        .single();
};

/**
 * Get a single entry by ID.
 * RLS ensures user can only fetch their own entries.
 */
export const getEntryById = async (
    supabase: SupabaseClient,
    entryId: string,
) => {
    return supabase
        .from("entries")
        .select("id, user_id, content, word_count, created_at, updated_at")
        .eq("id", entryId)
        .single();
};

/**
 * Get paginated entries for a user.
 * When using server client, RLS filters automatically.
 * When using admin client (dev/testing), pass userId to filter.
 */
export const getEntriesPaginated = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    userId?: string,
) => {
    const offset = (page - 1) * pageSize;

    let query = supabase
        .from("entries")
        .select("id, user_id, content, word_count, created_at, updated_at", {
            count: "exact",
        });

    // Filter by user when using admin client (no RLS)
    if (userId) {
        query = query.eq("user_id", userId);
    }

    return query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
};

/**
 * Update an entry's embedding after generation.
 */
export const updateEntryEmbedding = async (
    supabase: SupabaseClient,
    entryId: string,
    embedding: string,
) => {
    return supabase
        .from("entries")
        .update({ embedding })
        .eq("id", entryId)
        .select()
        .single();
};

/**
 * Increment the total_entries count in user_progress.
 * Creates row if it doesn't exist (handles manual user creation).
 */
export const incrementUserProgress = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    // Try to get current count
    const { data: progress } = await supabase
        .from("user_progress")
        .select("total_entries")
        .eq("user_id", userId)
        .single();

    const currentTotal = progress?.total_entries ?? 0;
    const newTotal = currentTotal + 1;

    // Upsert - insert if not exists, update if exists
    return supabase
        .from("user_progress")
        .upsert(
            {
                user_id: userId,
                total_entries: newTotal,
                entry_count_at_last_progress: 0,
            },
            { onConflict: "user_id" },
        )
        .select()
        .single();
};

/**
 * Search entries by embedding vector using semantic similarity.
 * Calls the search_entries_by_embedding RPC function.
 */
export const searchEntriesByEmbedding = async (
    supabase: SupabaseClient,
    userId: string,
    queryEmbedding: string,
    limit = 10,
    threshold = 0.5,
): Promise<{ data: EntryWithSimilarity[] | null; error: Error | null }> => {
    const { data, error } = await supabase.rpc("search_entries_by_embedding", {
        query_embedding: queryEmbedding,
        user_id_param: userId,
        match_threshold: threshold,
        match_count: limit,
    });

    return { data: data as EntryWithSimilarity[] | null, error };
};

/**
 * Find entries related to a specific entry by semantic similarity.
 * Calls the find_related_entries RPC function.
 */
export const findRelatedEntries = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
    limit = 5,
    threshold = 0.5,
): Promise<{ data: EntryWithSimilarity[] | null; error: Error | null }> => {
    const { data, error } = await supabase.rpc("find_related_entries", {
        entry_id_param: entryId,
        user_id_param: userId,
        match_threshold: threshold,
        match_count: limit,
    });

    return { data: data as EntryWithSimilarity[] | null, error };
};
