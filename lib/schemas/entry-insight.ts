import { z } from "zod";
import { INSIGHT_TAG_TYPES } from "@/lib/constants/insight-tag-types";

/**
 * AI response schema for a streamed entry insight.
 * Safe to import in client components — no server-only deps.
 */
export const insightSchema = z.object({
    insight: z.string(),
    tags: z.array(z.enum(INSIGHT_TAG_TYPES)).max(3),
});

export type InsightObject = z.infer<typeof insightSchema>;

/**
 * Schema for generating an entry insight
 * Used when calling the insight generation endpoint
 */
export const EntryInsightGenerateSchema = z.object({
    entry_id: z.uuid(),
    content: z.string().min(10),
});

export type EntryInsightGenerateInput = z.infer<
    typeof EntryInsightGenerateSchema
>;

/**
 * Schema for entry insight database row
 * Matches public.entry_insights table
 */
export const EntryInsightRowSchema = z.object({
    id: z.uuid(),
    user_id: z.string(),
    entry_id: z.uuid(),
    content: z.string(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
});

export type EntryInsightRow = z.infer<typeof EntryInsightRowSchema>;
