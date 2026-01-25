import type { Entry, EntryRowEncrypted } from "./entries";

// 1. RAW DATABASE TYPES (from RPC functions)

/**
 * Raw result from search_entries_by_embedding RPC.
 * Extends EntryRowEncrypted with similarity score.
 */
export interface SearchEntryRowResult extends EntryRowEncrypted {
    similarity: number;
}

// 2. DOMAIN MODELS (decrypted)

/**
 * Entry with similarity score from semantic search.
 * Decrypted and ready for application use.
 */
export interface EntryWithSimilarity extends Entry {
    similarity: number;
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
