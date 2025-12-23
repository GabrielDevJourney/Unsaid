import { z } from "zod";

// Entry content constraints
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 16000;

/**
 * Schema for creating a new entry
 * Content must be between 10-16000 characters (2500 words)
 */
export const EntryCreateSchema = z.object({
    content: z
        .string()
        .min(MIN_CONTENT_LENGTH, {
            message: `Entry must be at least ${MIN_CONTENT_LENGTH} characters`,
        })
        .max(MAX_CONTENT_LENGTH, {
            message: `Entry must be at most ${MAX_CONTENT_LENGTH} characters`,
        }),
});

export type EntryCreateInput = z.infer<typeof EntryCreateSchema>;

/**
 * Schema for pagination query params
 */
export const PaginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
