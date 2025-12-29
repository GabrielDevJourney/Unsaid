import type { Entry } from "./entries";

/**
 * Entry with similarity score from semantic search.
 * Excludes embedding field since it's not needed in search results.
 */
export interface EntryWithSimilarity extends Omit<Entry, "embedding"> {
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
