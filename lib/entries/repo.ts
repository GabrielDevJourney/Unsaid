import type { SupabaseClient } from "@supabase/supabase-js";
import type { InsertEntryData } from "@/types/domain/entries";

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
 * Uses RPC or direct update - admin client bypasses RLS for system operations.
 */
export const incrementUserProgress = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    // Get current count and increment
    const { data: progress, error: fetchError } = await supabase
        .from("user_progress")
        .select("total_entries")
        .eq("user_id", userId)
        .single();

    if (fetchError) {
        return { data: null, error: fetchError };
    }

    const newTotal = (progress?.total_entries ?? 0) + 1;

    return supabase
        .from("user_progress")
        .update({ total_entries: newTotal })
        .eq("user_id", userId);
};
