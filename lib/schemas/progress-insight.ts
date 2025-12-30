import { z } from "zod";

/**
 * Schema for entry data used in progress insight generation.
 */
export const EntryForProgressSchema = z.object({
    id: z.string().uuid(),
    content: z.string().min(1),
    createdAt: z.string(),
});

/**
 * Schema for related past entry with similarity score.
 */
export const RelatedPastEntrySchema = EntryForProgressSchema.extend({
    similarity: z.number().min(0).max(1).optional(),
});

/**
 * Schema for creating a progress insight.
 * Validates the input payload before processing.
 */
export const CreateProgressInsightSchema = z.object({
    recentEntryIds: z.array(z.string().uuid()).min(1),
    recentEntries: z.array(EntryForProgressSchema).min(1),
    relatedPastEntries: z.array(RelatedPastEntrySchema).optional(),
});

/**
 * Schema for inserting a progress insight into the database.
 */
export const InsertProgressInsightSchema = z.object({
    userId: z.string().min(1),
    content: z.string().min(1),
    recentEntryIds: z.array(z.string().uuid()),
    relatedPastEntryIds: z.array(z.string().uuid()).optional(),
});

/**
 * Schema for the API request to generate a progress insight.
 * The generate endpoint is internal/manual trigger only.
 */
export const GenerateProgressInsightRequestSchema = z.object({
    // userId is extracted from auth, not from request body
    // This schema validates any optional parameters
    forceGenerate: z.boolean().optional().default(false),
});

export type EntryForProgress = z.infer<typeof EntryForProgressSchema>;
export type RelatedPastEntry = z.infer<typeof RelatedPastEntrySchema>;
export type CreateProgressInsight = z.infer<typeof CreateProgressInsightSchema>;
export type InsertProgressInsight = z.infer<typeof InsertProgressInsightSchema>;
