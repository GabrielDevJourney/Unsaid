import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/ai/embeddings";
import {
    findRelatedEntries,
    getEntryById,
    searchEntriesByEmbedding,
} from "@/lib/entries/repo";
import type {
    RelatedEntriesResult,
    SemanticSearchResult,
    ServiceResult,
} from "@/types";

/**
 * Search journal entries by semantic similarity to a text query.
 *
 * Flow:
 * 1. Generate embedding for the search query
 * 2. Call RPC function to find similar entries
 * 3. Return results with similarity scores
 *
 * Returns error for expected failures (embedding failure).
 * Throws for unexpected DB errors.
 */
export const searchEntries = async (
    supabase: SupabaseClient,
    userId: string,
    query: string,
    limit = 10,
    threshold = 0.5,
): Promise<ServiceResult<SemanticSearchResult>> => {
    // Generate embedding for the search query
    let queryEmbedding: string;
    try {
        queryEmbedding = await generateEmbedding(query);
    } catch (embeddingError) {
        console.error("Failed to generate query embedding:", embeddingError);
        return { error: "Failed to process search query" };
    }

    // Search for similar entries
    const { data: entries, error: searchError } =
        await searchEntriesByEmbedding(
            supabase,
            userId,
            queryEmbedding,
            limit,
            threshold,
        );

    if (searchError) {
        console.error("Semantic search failed:", searchError);
        throw searchError;
    }

    const results = entries ?? [];

    return {
        data: {
            entries: results,
            query,
            totalFound: results.length,
        },
    };
};

/**
 * Find entries related to a specific entry by semantic similarity.
 *
 * Flow:
 * 1. Verify source entry exists and belongs to user
 * 2. Call RPC function to find related entries (uses source entry's embedding)
 * 3. Return results with similarity scores
 *
 * Returns error for expected failures (entry not found).
 * Throws for unexpected DB errors.
 */
export const getRelatedEntries = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
    limit = 5,
    threshold = 0.5,
): Promise<ServiceResult<RelatedEntriesResult>> => {
    // Verify source entry exists and belongs to user
    const { data: sourceEntry, error: entryError } = await getEntryById(
        supabase,
        entryId,
    );

    if (entryError) {
        // PGRST116 = no rows returned (not found or RLS blocked)
        if ("code" in entryError && entryError.code === "PGRST116") {
            return { error: "Entry not found" };
        }
        console.error("Failed to fetch source entry:", entryError);
        throw entryError;
    }

    if (!sourceEntry) {
        return { error: "Entry not found" };
    }

    // Find related entries using the RPC function
    // The RPC function handles getting the source entry's embedding internally
    const { data: relatedEntries, error: searchError } =
        await findRelatedEntries(supabase, userId, entryId, limit, threshold);

    if (searchError) {
        console.error("Related entries search failed:", searchError);
        throw searchError;
    }

    const results = relatedEntries ?? [];

    return {
        data: {
            entries: results,
            sourceEntryId: entryId,
            totalFound: results.length,
        },
    };
};
