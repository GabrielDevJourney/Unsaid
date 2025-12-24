import type { PatternTypeCode } from "@/lib/constants/pattern-types";
import type { Tables } from "../database";

// 1. Raw Types from the Database
export type EntryInsight = Tables<"entry_insights">;
export type WeeklyInsight = Tables<"weekly_insights">;
export type WeeklyInsightPattern = Tables<"weekly_insight_patterns">;
export type ProgressInsight = Tables<"progress_insights">;

// 2. Domain Enums/Unions
export type { PatternTypeCode };

// 3. Service Payloads (Inputs)

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
    weekStart: string; // ISO date string (YYYY-MM-DD)
    entryIds: string[];
    entries: Array<{
        id: string;
        content: string;
        createdAt: string;
    }>;
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

// 4. Enhanced Domain Model (Outputs)
export interface WeeklyInsightWithPatterns extends WeeklyInsight {
    patterns: WeeklyInsightPattern[];
}
