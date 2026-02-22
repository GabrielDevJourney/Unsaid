import type { Entry, EntryInsightSummary, EntryRowEncrypted } from "./entries";

// 1. RAW DATABASE TYPES (from RPC functions)

/**
 * Raw result from search_entries_by_embedding RPC.
 * Extends EntryRowEncrypted with similarity score and optional insight columns.
 * Insight columns are nullable because the RPC uses LEFT JOIN on entry_insights.
 */
export interface SearchEntryRowResult extends EntryRowEncrypted {
    similarity: number;
    insight_id: string | null;
    insight_encrypted_content: string | null;
    insight_content_iv: string | null;
    insight_content_tag: string | null;
    insight_tags: string[] | null;
    insight_count: number | null;
    insight_created_at: string | null;
}

// 2. DOMAIN MODELS (decrypted)

/**
 * Entry with similarity score and optional insight from semantic search.
 * Decrypted and ready for application use.
 */
export interface EntryWithSimilarity extends Entry {
    similarity: number;
    entryInsight: EntryInsightSummary | null;
}

/**
 * Semantic search result payload.
 */
export interface SemanticSearchResult {
    entries: EntryWithSimilarity[];
    query: string;
    totalFound: number;
}

/**
 * Related entries result payload.
 */
export interface RelatedEntriesResult {
    entries: EntryWithSimilarity[];
    sourceEntryId: string;
    totalFound: number;
}
