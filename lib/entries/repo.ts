import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    Entry,
    EntryWithInsight,
    EntryWithSimilarity,
    InsertEntryData,
    SearchEntryRowResult,
} from "@/types";
import { encrypt } from "../crypto";
import {
    toEntry,
    toEntryInsightEmbed,
    toEntryWithSimilarity,
} from "./transformers";

/**
 * Insert a new entry into the database.
 * Encrypts content before storing.
 * RLS will verify the user owns this entry.
 */
export const insertEntry = async (
    supabase: SupabaseClient,
    data: InsertEntryData,
): Promise<{ data: Entry | null; error: Error | null }> => {
    const { encryptedContent, iv, tag } = encrypt(data.content);

    const { data: entryRow, error } = await supabase
        .from("entries")
        .insert({
            user_id: data.userId,
            encrypted_content: encryptedContent,
            content_iv: iv,
            content_tag: tag,
            word_count: data.wordCount,
        })
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at",
        )
        .single();

    if (error || !entryRow) {
        return { data: null, error };
    }

    return { data: toEntry(entryRow), error: null };
};

/**
 * Get a single entry by ID.
 * Decrypts content before returning.
 * RLS ensures user can only fetch their own entries.
 */
export const getEntryById = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: Entry | null; error: Error | null }> => {
    const { data: entryRow, error } = await supabase
        .from("entries")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at",
        )
        .eq("id", entryId)
        .single();

    if (error || !entryRow) {
        return { data: null, error };
    }

    return { data: toEntry(entryRow), error: null };
};

/**
 * Get paginated entries for a user.
 * Decrypts content for each entry.
 * When using server client, RLS filters automatically.
 * When using admin client (dev/testing), pass userId to filter.
 */
export const getEntriesPaginated = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    userId?: string,
): Promise<{
    data: Entry[];
    error: Error | null;
    count: number;
}> => {
    const offset = (page - 1) * pageSize;

    let query = supabase
        .from("entries")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at",
            { count: "exact" },
        );

    if (userId) {
        query = query.eq("user_id", userId);
    }

    const {
        data: entryRows,
        error,
        count,
    } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error || !entryRows) {
        return { data: [], error, count: 0 };
    }

    return {
        data: entryRows.map(toEntry),
        error: null,
        count: count ?? 0,
    };
};

/**
 * Get paginated entries WITH their insights (1:1 relation).
 * Uses Supabase foreign table join to avoid N+1 queries.
 * Decrypts both entry content and insight content.
 */
export const getEntriesWithInsightsPaginated = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    userId?: string,
): Promise<{
    data: EntryWithInsight[];
    error: Error | null;
    count: number;
}> => {
    const offset = (page - 1) * pageSize;

    let query = supabase.from("entries").select(
        `
        id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at,
        entry_insights (
            id, encrypted_content, content_iv, content_tag, created_at
        )
        `,
        { count: "exact" },
    );

    if (userId) {
        query = query.eq("user_id", userId);
    }

    const {
        data: entryRows,
        error,
        count,
    } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error || !entryRows) {
        return { data: [], error, count: 0 };
    }

    const entries: EntryWithInsight[] = entryRows.map((entryRow) => {
        const entry = toEntry(entryRow);
        // Supabase returns array for joins even on 1:1 relations - take first element
        const insightData = Array.isArray(entryRow.entry_insights)
            ? entryRow.entry_insights[0]
            : entryRow.entry_insights;
        const insight = insightData ? toEntryInsightEmbed(insightData) : null;

        return { ...entry, entryInsight: insight };
    });

    return { data: entries, error: null, count: count ?? 0 };
};

/**
 * Get single entry WITH its insight.
 * Uses Supabase foreign table join.
 * Decrypts both entry content and insight content.
 */
export const getEntryWithInsightById = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: EntryWithInsight | null; error: Error | null }> => {
    const { data: entryRow, error } = await supabase
        .from("entries")
        .select(
            `
            id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at,
            entry_insights (
                id, encrypted_content, content_iv, content_tag, created_at
            )
            `,
        )
        .eq("id", entryId)
        .single();

    if (error || !entryRow) {
        return { data: null, error };
    }

    const entry = toEntry(entryRow);
    // Supabase returns array for joins even on 1:1 relations - take first element
    const insightData = Array.isArray(entryRow.entry_insights)
        ? entryRow.entry_insights[0]
        : entryRow.entry_insights;
    const insight = insightData ? toEntryInsightEmbed(insightData) : null;

    return { data: { ...entry, entryInsight: insight }, error: null };
};

/**
 * Update an entry's embedding after generation.
 */
export const updateEntryEmbedding = async (
    supabase: SupabaseClient,
    entryId: string,
    embedding: string,
): Promise<{ data: Entry | null; error: Error | null }> => {
    const { data: entryRow, error } = await supabase
        .from("entries")
        .update({ embedding })
        .eq("id", entryId)
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at",
        )
        .single();

    if (error || !entryRow) {
        return { data: null, error };
    }

    return { data: toEntry(entryRow), error: null };
};

/**
 * Increment the total_entries count in user_progress.
 * Creates row if it doesn't exist (handles manual user creation).
 */
export const incrementUserProgress = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    const { data: progress } = await supabase
        .from("user_progress")
        .select("total_entries")
        .eq("user_id", userId)
        .single();

    const currentTotal = progress?.total_entries ?? 0;
    const newTotal = currentTotal + 1;

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
 * Decrypts content for each result.
 */
export const searchEntriesByEmbedding = async (
    supabase: SupabaseClient,
    userId: string,
    queryEmbedding: string,
    limit = 10,
    threshold = 0.5,
): Promise<{ data: EntryWithSimilarity[] | null; error: Error | null }> => {
    const { data: searchRows, error } = await supabase.rpc(
        "search_entries_by_embedding",
        {
            query_embedding: queryEmbedding,
            user_id_param: userId,
            match_threshold: threshold,
            match_count: limit,
        },
    );

    if (error || !searchRows) {
        return { data: null, error };
    }

    const entries = (searchRows as SearchEntryRowResult[]).map(
        toEntryWithSimilarity,
    );
    return { data: entries, error: null };
};

/**
 * Find entries related to a specific entry by semantic similarity.
 * Calls the find_related_entries RPC function.
 * Decrypts content for each result.
 */
export const findRelatedEntries = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
    limit = 5,
    threshold = 0.5,
): Promise<{ data: EntryWithSimilarity[] | null; error: Error | null }> => {
    const { data: searchRows, error } = await supabase.rpc(
        "find_related_entries",
        {
            entry_id_param: entryId,
            user_id_param: userId,
            match_threshold: threshold,
            match_count: limit,
        },
    );

    if (error || !searchRows) {
        return { data: null, error };
    }

    const entries = (searchRows as SearchEntryRowResult[]).map(
        toEntryWithSimilarity,
    );
    return { data: entries, error: null };
};
