import { z } from "zod";

/**
 * Schema for semantic search query parameters.
 * Used for GET /api/entries/search?q=...
 */
export const SemanticSearchQuerySchema = z.object({
    q: z
        .string()
        .min(3, "Search query must be at least 3 characters")
        .max(500, "Search query too long"),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    threshold: z.coerce.number().min(0).max(1).default(0.5),
});

export type SemanticSearchQueryInput = z.infer<
    typeof SemanticSearchQuerySchema
>;

/**
 * Schema for related entries query parameters.
 * Used for GET /api/entries/:id/related
 */
export const RelatedEntriesQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(20).default(5),
    threshold: z.coerce.number().min(0).max(1).default(0.5),
});

export type RelatedEntriesQueryInput = z.infer<
    typeof RelatedEntriesQuerySchema
>;
