import { z } from "zod";

// Feedback categories
export const FeedbackCategory = z.enum([
    "bug",
    "feature",
    "improvement",
    "other",
]);
export type FeedbackCategoryType = z.infer<typeof FeedbackCategory>;

// Feedback status (admin-managed)
export const FeedbackStatus = z.enum([
    "new",
    "planned",
    "in_progress",
    "completed",
    "wont_do",
]);
export type FeedbackStatusType = z.infer<typeof FeedbackStatus>;

// Sort options for feedback list
export const FeedbackSort = z.enum(["votes", "newest"]);
export type FeedbackSortType = z.infer<typeof FeedbackSort>;

/**
 * Schema for creating new feedback post
 */
export const FeedbackCreateSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters" })
        .max(200, { message: "Title must be at most 200 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" })
        .max(2000, { message: "Description must be at most 2000 characters" }),
    category: FeedbackCategory,
});

export type FeedbackCreateInput = z.infer<typeof FeedbackCreateSchema>;

/**
 * Schema for creating a comment on feedback
 */
export const FeedbackCommentSchema = z.object({
    description: z
        .string()
        .min(2, { message: "Comment must be at least 2 characters" })
        .max(1000, { message: "Comment must be at most 1000 characters" }),
});

export type FeedbackCommentInput = z.infer<typeof FeedbackCommentSchema>;

/**
 * Schema for updating feedback status (admin only)
 */
export const FeedbackStatusUpdateSchema = z.object({
    status: FeedbackStatus,
});

export type FeedbackStatusUpdateInput = z.infer<
    typeof FeedbackStatusUpdateSchema
>;

/**
 * Schema for feedback list query params
 */
export const FeedbackListQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    sort: FeedbackSort.default("votes"),
    status: FeedbackStatus.or(z.literal("all")).default("all"),
});

export type FeedbackListQueryInput = z.infer<typeof FeedbackListQuerySchema>;

/**
 * Schema for feedback ID param
 */
export const FeedbackIdSchema = z.string().uuid("Invalid feedback ID");
