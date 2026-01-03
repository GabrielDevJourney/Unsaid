import { z } from "zod";
import { MAX_ENTRY_LENGTH, MIN_ENTRY_LENGTH } from "@/lib/constants";

/**
 * Schema for creating a new entry
 * Content must be between 10-16000 characters (2500 words)
 */
export const EntryCreateSchema = z.object({
    content: z
        .string()
        .min(MIN_ENTRY_LENGTH, {
            message: `Entry must be at least ${MIN_ENTRY_LENGTH} characters`,
        })
        .max(MAX_ENTRY_LENGTH, {
            message: `Entry must be at most ${MAX_ENTRY_LENGTH} characters`,
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
