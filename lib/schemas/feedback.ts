import { z } from "zod";

// Status enum matches the feedback_status DB enum
export const FeedbackStatusEnum = z.enum([
    "open",
    "in_progress",
    "completed",
    "wont_do",
    "rejected",
]);
export type FeedbackStatusType = z.infer<typeof FeedbackStatusEnum>;

// Sort options for the feedback list — reserved for future sort UI
export const FeedbackSortEnum = z.enum(["relevant", "recent", "upvoted"]);
export type FeedbackSortType = z.infer<typeof FeedbackSortEnum>;

// UUID validator for feedback item IDs
export const FeedbackIdSchema = z
    .string()
    .uuid({ message: "Invalid feedback ID" });

// Schema for user submissions
export const SubmitFeedbackSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters" })
        .max(200, { message: "Title must be at most 200 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" })
        .max(2000, { message: "Description must be at most 2000 characters" }),
    isAnonymous: z.boolean().default(true),
    authorName: z.string().max(100).nullable().optional(),
    // Only accept URLs from this project's Supabase storage (prod + local dev)
    imageUrl: z
        .string()
        .url()
        .refine(
            (url) => {
                try {
                    const { hostname, pathname } = new URL(url);
                    const isAllowedHost =
                        hostname === "vmhlernvxnixomfvpbsp.supabase.co" ||
                        hostname === "127.0.0.1";
                    return (
                        isAllowedHost &&
                        pathname.startsWith("/storage/v1/object/public/")
                    );
                } catch {
                    return false;
                }
            },
            { message: "Image must be from Supabase storage" },
        )
        .nullable()
        .optional(),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

// Schema for admin reply
export const AdminReplySchema = z.object({
    reply: z
        .string()
        .min(1, { message: "Reply cannot be empty" })
        .max(2000, { message: "Reply must be at most 2000 characters" }),
});
export type AdminReplyInput = z.infer<typeof AdminReplySchema>;
