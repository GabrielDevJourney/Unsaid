import { z } from "zod";

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
