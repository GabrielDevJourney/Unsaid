import type { PatternTypeCode } from "@/lib/constants/pattern-types";
import type { Tables } from "../database";
import type { EntryMinimal, EntryMinimalWithSimilarity } from "./entries";

// 1. RAW DATABASE TYPES (encrypted, snake_case)

/**
 * Raw entry insight row from database with encrypted content.
 */
export type EntryInsightRow = Tables<"entry_insights">;

/**
 * Raw weekly insight row from database (no encrypted fields).
 */
export type WeeklyInsightRow = Tables<"weekly_insights">;

/**
 * Raw weekly insight pattern row from database with encrypted fields.
 */
export type WeeklyInsightPatternRow = Tables<"weekly_insight_patterns">;

/**
 * Raw progress insight row from database with encrypted content.
 */
export type ProgressInsightRow = Tables<"progress_insights">;

/**
 * Entry insight row for transformer input.
 */
export interface EntryInsightRowEncrypted {
    id: string;
    user_id: string;
    entry_id: string;
    encrypted_content: string | null;
    content_iv: string | null;
    content_tag: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Progress insight row for transformer input.
 */
export interface ProgressInsightRowEncrypted {
    id: string;
    user_id: string;
    encrypted_content: string | null;
    content_iv: string | null;
    content_tag: string | null;
    recent_entry_ids: string[];
    related_past_entry_ids: string[] | null;
    created_at: string;
    updated_at: string;
}

/**
 * Weekly insight row for transformer input (no encryption).
 */
export interface WeeklyInsightRowData {
    id: string;
    user_id: string;
    week_start: string;
    entry_ids: string[];
    created_at: string;
    updated_at: string;
}

/**
 * Weekly insight pattern row for transformer input.
 */
export interface WeeklyInsightPatternRowEncrypted {
    id: string;
    weekly_insight_id: string;
    title: string;
    pattern_type: string;
    encrypted_description: string | null;
    description_iv: string | null;
    description_tag: string | null;
    evidence: string[];
    encrypted_question: string | null;
    question_iv: string | null;
    question_tag: string | null;
    encrypted_suggested_experiment: string | null;
    suggested_experiment_iv: string | null;
    suggested_experiment_tag: string | null;
    created_at: string;
}

// Re-export EntryMinimal types for convenience
export type { EntryMinimal, EntryMinimalWithSimilarity };

// 2. DOMAIN MODELS (decrypted, camelCase)

/**
 * Decrypted entry insight for application use.
 */
export interface EntryInsight {
    id: string;
    userId: string;
    entryId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Weekly insight (no encrypted fields, just metadata).
 */
export interface WeeklyInsight {
    id: string;
    userId: string;
    weekStart: string;
    entryIds: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Decrypted weekly insight pattern for application use.
 */
export interface WeeklyInsightPattern {
    id: string;
    weeklyInsightId: string;
    title: string;
    patternType: PatternTypeCode;
    description: string;
    evidence: string[];
    question: string | null;
    suggestedExperiment: string | null;
    createdAt: string;
}

/**
 * Weekly insight with its patterns.
 */
export interface WeeklyInsightWithPatterns extends WeeklyInsight {
    patterns: WeeklyInsightPattern[];
}

/**
 * Decrypted progress insight for application use.
 */
export interface ProgressInsight {
    id: string;
    userId: string;
    content: string;
    recentEntryIds: string[];
    relatedPastEntryIds: string[] | null;
    createdAt: string;
    updatedAt: string;
}

// 3. DOMAIN ENUMS/UNIONS

export type { PatternTypeCode };

// 4. SERVICE PAYLOADS (Inputs)

// Entry Insights
export interface CreateEntryInsightPayload {
    content: string;
    entryId: string;
}

export interface InsertEntryInsightData {
    userId: string;
    entryId: string;
    content: string;
}

// Weekly Insights
export interface CreateWeeklyInsightPayload {
    weekStart: string;
    entryIds: string[];
    entries: EntryMinimal[];
}

export interface InsertWeeklyInsightData {
    userId: string;
    weekStart: string;
    entryIds: string[];
}

export interface InsertWeeklyInsightPatternData {
    weeklyInsightId: string;
    title: string;
    patternType: PatternTypeCode;
    description: string;
    evidence: string[];
    question?: string;
    suggestedExperiment?: string;
}

// Progress Insights
export interface CreateProgressInsightPayload {
    recentEntryIds: string[];
    recentEntries: EntryMinimal[];
    relatedPastEntries?: EntryMinimalWithSimilarity[];
}

export interface InsertProgressInsightData {
    userId: string;
    content: string;
    recentEntryIds: string[];
    relatedPastEntryIds?: string[];
}
