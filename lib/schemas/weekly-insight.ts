import { z } from "zod";
import { PATTERN_TYPE_CODES } from "@/lib/constants/pattern-types";

/**
 * Schema for weekStart URL parameter (YYYY-MM-DD format)
 */
export const WeekStartParamSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD");

/**
 * Schema for a single pattern found in weekly analysis
 */
export const PatternSchema = z.object({
    title: z.string().min(1),
    pattern_type: z.enum(PATTERN_TYPE_CODES),
    description: z.string().min(1),
    evidence: z.array(z.uuid()).min(1),
    question: z.string().optional(),
    suggested_experiment: z.string().optional(),
});

export type Pattern = z.infer<typeof PatternSchema>;

/**
 * Schema for AI response (array of patterns)
 * Used to validate AI output before saving
 */
export const WeeklyInsightResponseSchema = z.array(PatternSchema).min(1).max(5);

export type WeeklyInsightResponse = z.infer<typeof WeeklyInsightResponseSchema>;

/**
 * Schema for creating a weekly insight (service input)
 */
export const WeeklyInsightCreateSchema = z.object({
    week_start: z.string(), // ISO date string (YYYY-MM-DD)
    entry_ids: z.array(z.uuid()).min(1),
});

export type WeeklyInsightCreateInput = z.infer<
    typeof WeeklyInsightCreateSchema
>;

/**
 * Schema for weekly insight row (from database)
 */
export const WeeklyInsightRowSchema = z.object({
    id: z.uuid(),
    user_id: z.string(),
    week_start: z.string(),
    entry_ids: z.array(z.uuid()),
    created_at: z.string(),
    updated_at: z.string(),
});

export type WeeklyInsightRow = z.infer<typeof WeeklyInsightRowSchema>;

/**
 * Schema for pattern row (from database)
 */
export const WeeklyInsightPatternRowSchema = z.object({
    id: z.uuid(),
    weekly_insight_id: z.uuid(),
    title: z.string(),
    pattern_type: z.enum(PATTERN_TYPE_CODES),
    description: z.string(),
    evidence: z.array(z.uuid()),
    question: z.string().nullable(),
    suggested_experiment: z.string().nullable(),
    created_at: z.string(),
});

export type WeeklyInsightPatternRow = z.infer<
    typeof WeeklyInsightPatternRowSchema
>;
