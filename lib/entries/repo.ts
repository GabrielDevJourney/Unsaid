import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type {
    Entry,
    EntrySourceRow,
    EntryWithAllInsights,
    EntryWithInsight,
    EntryWithSimilarity,
    InsertEntryData,
    SearchEntryRowResult,
} from "@/types";
import { encrypt } from "../crypto";
import {
    toEntry,
    toEntryWithAllInsights,
    toEntryWithInsight,
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
): Promise<{ data: Entry | null; error: PostgrestError | null }> => {
    const { encryptedContent, iv, tag } = encrypt(data.content);

    const { data: entryRow, error } = await supabase
        .from("entries")
        .insert({
            user_id: data.userId,
            encrypted_content: encryptedContent,
            content_iv: iv,
            content_tag: tag,
            word_count: data.wordCount,
            source_type: data.sourceType ?? null,
            source_id: data.sourceId ?? null,
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

export const findEntryById = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: Entry | null; error: PostgrestError | null }> => {
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

export const findEntriesByIds = async (
    supabase: SupabaseClient,
    entryIds: string[],
): Promise<{ data: Entry[]; error: PostgrestError | null }> => {
    if (entryIds.length === 0) return { data: [], error: null };

    const { data: rows, error } = await supabase
        .from("entries")
        .select(
            "id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at",
        )
        .in("id", entryIds);

    if (error || !rows) return { data: [], error };
    return { data: rows.map(toEntry), error: null };
};

/**
 * Get entries linked to a specific source (pattern or progress insight).
 * Joins entry_insights so the service layer can decrypt insight prose.
 * RLS scopes results to the authenticated user automatically.
 */
export const findEntriesBySource = async (
    supabase: SupabaseClient,
    sourceType: string,
    sourceId: string,
): Promise<{ data: EntrySourceRow[]; error: PostgrestError | null }> => {
    const { data: rows, error } = await supabase
        .from("entries")
        .select(
            `id, word_count, created_at,
             entry_insights ( encrypted_content, content_iv, content_tag )`,
        )
        .eq("source_type", sourceType)
        .eq("source_id", sourceId)
        .order("created_at", { ascending: false });

    if (error || !rows) return { data: [], error };
    return { data: rows as EntrySourceRow[], error: null };
};

/**
 * Get paginated entries for a user.
 * Decrypts content for each entry.
 * When using server client, RLS filters automatically.
 * When using admin client (dev/testing), pass userId to filter.
 */
export const findEntriesPaginated = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    userId?: string,
): Promise<{
    data: Entry[];
    error: PostgrestError | null;
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
 * Fetch only created_at dates for all user entries.
 * Lightweight query used to populate the calendar without loading full entry data.
 * RLS filters to the authenticated user automatically.
 */
export const findEntryDates = async (
    supabase: SupabaseClient,
): Promise<{ data: string[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("entries")
        .select("created_at")
        .order("created_at", { ascending: false });

    if (error || !data) return { data: [], error };
    return { data: data.map((e) => e.created_at as string), error: null };
};

export const findEntriesWithInsights = async (
    supabase: SupabaseClient,
): Promise<{
    data: EntryWithInsight[];
    error: PostgrestError | null;
}> => {
    const query = supabase.from("entries").select(
        `
        id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at,
        entry_insights (
            id, encrypted_content, content_iv, content_tag, tags, generation_order, content_before_length, created_at
        )
        `,
    );

    const { data: entryRows, error } = await query.order("created_at", {
        ascending: false,
    });

    if (error || !entryRows) {
        return { data: [], error };
    }

    return { data: entryRows.map(toEntryWithInsight), error: null };
};

/**
 * Get paginated entries WITH their latest insight.
 * Uses Supabase foreign table join to avoid N+1 queries.
 * Decrypts both entry content and insight content.
 * Returns only the latest insight per entry (for list views, cards).
 */
export const findEntriesWithInsightsPaginated = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    userId?: string,
): Promise<{
    data: EntryWithInsight[];
    error: PostgrestError | null;
    count: number;
}> => {
    const offset = (page - 1) * pageSize;

    let query = supabase.from("entries").select(
        `
        id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at,
        entry_insights (
            id, encrypted_content, content_iv, content_tag, tags, generation_order, content_before_length, created_at
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

    return {
        data: entryRows.map(toEntryWithInsight),
        error: null,
        count: count ?? 0,
    };
};

export const findEntryWithInsightById = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: EntryWithInsight | null; error: PostgrestError | null }> => {
    const { data: entryRow, error } = await supabase
        .from("entries")
        .select(
            `
            id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at,
            entry_insights (
                id, encrypted_content, content_iv, content_tag, tags, generation_order, content_before_length, created_at
            )
            `,
        )
        .eq("id", entryId)
        .single();

    if (error || !entryRow) {
        return { data: null, error };
    }

    return { data: toEntryWithInsight(entryRow), error: null };
};

/**
 * Get single entry WITH all insight generations, ordered ASC.
 * Used by the editor to reconstruct segment layout on reload.
 */
export const findEntryWithAllInsightsById = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{
    data: EntryWithAllInsights | null;
    error: PostgrestError | null;
}> => {
    const { data: entryRow, error } = await supabase
        .from("entries")
        .select(
            `
            id, user_id, encrypted_content, content_iv, content_tag, word_count, created_at, updated_at,
            entry_insights (
                id, encrypted_content, content_iv, content_tag, tags, generation_order, content_before_length, created_at
            )
            `,
        )
        .eq("id", entryId)
        .order("generation_order", {
            ascending: true,
            referencedTable: "entry_insights",
        })
        .single();

    if (error || !entryRow) {
        return { data: null, error };
    }

    return { data: toEntryWithAllInsights(entryRow), error: null };
};

/**
 * Update an entry's content (re-encrypts).
 * Explicit userId filter + RLS for defence-in-depth.
 */
export const updateEntryContent = async (
    supabase: SupabaseClient,
    entryId: string,
    userId: string,
    data: { content: string; wordCount: number },
): Promise<{ data: Entry | null; error: PostgrestError | null }> => {
    const { encryptedContent, iv, tag } = encrypt(data.content);

    const { data: entryRow, error } = await supabase
        .from("entries")
        .update({
            encrypted_content: encryptedContent,
            content_iv: iv,
            content_tag: tag,
            word_count: data.wordCount,
        })
        .eq("id", entryId)
        .eq("user_id", userId)
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
 * Update an entry's embedding after generation.
 */
export const updateEntryEmbedding = async (
    supabase: SupabaseClient,
    entryId: string,
    embedding: string,
): Promise<{ data: Entry | null; error: PostgrestError | null }> => {
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
 * Delete an entry by ID.
 * RLS ensures users can only delete their own entries.
 * Cascades to entry_insights and prompts automatically.
 */
export const deleteEntry = async (
    supabase: SupabaseClient,
    entryId: string,
    userId: string,
): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", userId);

    return { error };
};

/**
 * Search entries by embedding vector using semantic similarity.
 * Calls the search_entries_by_embedding RPC function.
 * Decrypts content for each result.
 */
export const findEntriesByEmbedding = async (
    supabase: SupabaseClient,
    userId: string,
    queryEmbedding: string,
    limit = 10,
    threshold = 0.5,
): Promise<{ data: EntryWithSimilarity[]; error: PostgrestError | null }> => {
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
        return { data: [], error };
    }

    return {
        data: (searchRows as SearchEntryRowResult[]).map(toEntryWithSimilarity),
        error: null,
    };
};

/**
 * Get entry id + created_at for a list of entry IDs.
 * Used to resolve entry dates for progress insight reference panels.
 * RLS ensures only the user's own entries are returned.
 * No decryption needed — only metadata is fetched.
 */
export const findEntryDatesByIds = async (
    supabase: SupabaseClient,
    ids: string[],
): Promise<{
    data: { id: string; createdAt: string }[];
    error: PostgrestError | null;
}> => {
    if (ids.length === 0) return { data: [], error: null };

    const { data: rows, error } = await supabase
        .from("entries")
        .select("id, created_at")
        .in("id", ids);

    if (error || !rows) {
        return { data: [], error };
    }

    return {
        data: rows.map((r) => ({ id: r.id, createdAt: r.created_at })),
        error: null,
    };
};

export const findRelatedEntries = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
    limit = 5,
    threshold = 0.5,
): Promise<{ data: EntryWithSimilarity[]; error: PostgrestError | null }> => {
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
        return { data: [], error };
    }

    return {
        data: (searchRows as SearchEntryRowResult[]).map(toEntryWithSimilarity),
        error: null,
    };
};

export const findEntryEncryptedFields = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{
    data: {
        encrypted_content: string;
        content_iv: string;
        content_tag: string;
    } | null;
    error: PostgrestError | null;
}> => {
    const { data, error } = await supabase
        .from("entries")
        .select("encrypted_content, content_iv, content_tag")
        .eq("id", entryId)
        .single();
    return { data, error };
};

export const findLatestEntryByUser = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{
    data: { created_at: string } | null;
    error: PostgrestError | null;
}> => {
    const { data, error } = await supabase
        .from("entries")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    return { data, error };
};

export const findAllEntriesByDateRange = async (
    supabase: SupabaseClient,
    from: string,
    to: string,
): Promise<{
    data:
        | {
              id: string;
              user_id: string;
              encrypted_content: string | null;
              content_iv: string | null;
              content_tag: string | null;
              created_at: string;
          }[]
        | null;
    error: PostgrestError | null;
}> => {
    const { data, error } = await supabase
        .from("entries")
        .select(
            "id, user_id, encrypted_content, content_tag, content_iv, created_at",
        )
        .gte("created_at", from)
        .lte("created_at", to)
        .order("created_at", { ascending: true });
    return { data, error };
};

export const countEntriesByUserId = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ count: number; error: PostgrestError | null }> => {
    const { count, error } = await supabase
        .from("entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
    return { count: count ?? 0, error };
};
