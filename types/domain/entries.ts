import type { Tables } from "../database";

// 1. RAW DATABASE TYPES (encrypted, snake_case)

/**
 * Raw entry row from database with encrypted content.
 * This is only used in repo layer when working directly with Supabase.
 */
export type EntryRow = Tables<"entries">;

/**
 * Partial entry row for standard queries (excludes embedding).
 * Matches the common select pattern in repos.
 */
export interface EntryRowEncrypted {
    id: string;
    user_id: string;
    encrypted_content: string | null;
    content_iv: string | null;
    content_tag: string | null;
    word_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * Base fields shared by all minimal encrypted row types.
 */
export interface EncryptedRowBase {
    id: string;
    encrypted_content: string | null;
    content_iv: string | null;
    content_tag: string | null;
    created_at: string;
}

/**
 * Minimal entry row for lightweight queries.
 * Used when only id, content, and date are needed.
 */
export interface EntryRowEncryptedMinimal extends EncryptedRowBase {}

/**
 * Minimal insight row returned from Supabase join queries.
 */
export interface EntryInsightRowMinimal extends EncryptedRowBase {
    tags: string[] | null;
    generation_order: number;
    content_before_length: number | null;
}

/**
 * Entry row with nested insight(s) from Supabase join query.
 * With 1:N relation PostgREST always returns an array.
 */
export interface EntryRowWithInsights extends EntryRowEncrypted {
    entry_insights: EntryInsightRowMinimal | EntryInsightRowMinimal[] | null;
}

/**
 * Row shape returned by getEntriesBySource (entries + nested insight).
 * For repo layer use only.
 */
export interface EntrySourceRow {
    id: string;
    word_count: number;
    created_at: string;
    entry_insights:
        | {
              encrypted_content: string | null;
              content_iv: string | null;
              content_tag: string | null;
          }
        | {
              encrypted_content: string | null;
              content_iv: string | null;
              content_tag: string | null;
          }[]
        | null;
}

// 2. DOMAIN MODELS (decrypted, camelCase, frontend contract)

/**
 * Decrypted entry for application use.
 * This is what services and frontend work with.
 */
export interface Entry {
    id: string;
    userId: string;
    content: string;
    wordCount: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Minimal entry reference - decrypted.
 * Used for AI context, payloads, and cross-service references.
 */
export interface EntryMinimal {
    id: string;
    content: string;
    createdAt: string;
}

/**
 * Minimal entry with optional similarity score.
 * Used in semantic search results and related entries.
 */
export interface EntryMinimalWithSimilarity extends EntryMinimal {
    similarity?: number;
}

/**
 * Entry insight embed for nested relations.
 */
export interface EntryInsightSummary {
    id: string;
    content: string;
    tags: string[];
    /** @deprecated use generationOrder — kept for consumer compat */
    insightCount: number;
    generationOrder: number;
    contentBeforeLength: number | null;
    createdAt: string;
}

/**
 * Entry with its latest insight (for list views, cards, exports, etc.).
 */
export interface EntryWithInsight extends Entry {
    entryInsight: EntryInsightSummary | null;
}

/**
 * Entry with all insight generations ordered ASC. Editor use only.
 */
export interface EntryWithAllInsights extends EntryWithInsight {
    entryInsights: EntryInsightSummary[];
}

/**
 * Compact entry preview for the "Your reflections" section on pattern/progress detail pages.
 * Contains just enough data to render a linked preview row.
 */
export interface EntryReflectionPreview {
    id: string;
    createdAt: string;
    wordCount: number;
    insightContent: string | null; // null if no insight generated yet
}

// 3. SERVICE PAYLOADS (Inputs)

/**
 * Payload for creating a new entry (from user input).
 */
export interface CreateEntryPayload {
    content: string;
    sourceType?: string | null;
    sourceId?: string | null;
}

/**
 * Internal data for inserting entry into database.
 * Used by repo layer.
 */
export interface InsertEntryData {
    userId: string;
    content: string;
    wordCount: number;
    sourceType?: string | null;
    sourceId?: string | null;
}

// 4. PAGINATED RESULTS

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}

export interface PaginatedEntries {
    data: Entry[];
    pagination: Pagination;
}

export interface PaginatedEntriesWithInsights {
    data: EntryWithInsight[];
    pagination: Pagination;
}

// 5. UTILITY TYPES

export interface RateLimitResult {
    allowed: boolean;
    reason?: string;
}
