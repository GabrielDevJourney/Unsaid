import type { Tables } from "../database";

// 1. Raw Types from the Database
export type EntryInsight = Tables<"entry_insights">;
export type WeeklyInsight = Tables<"weekly_insights">;
export type ProgressInsight = Tables<"progress_insights">;

// 2. Domain Enums/Unions

// 3. Service Payloads (Inputs)
export interface CreateEntryInsightPayload {
    content: string;
    entryId: string;
}

export interface InsertEntryInsightData {
    userId: string;
    entryId: string;
    content: string;
}

// 4. Enhanced Domain Model (Outputs)
