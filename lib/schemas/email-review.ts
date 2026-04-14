import { z } from "zod";

export const EmailReviewRequestSchema = z.object({
    email: z.email(),
    template: z.enum([
        "all",
        "writing",
        "weekly",
        "trial",
        "progress",
        "waitlist",
    ]),
    preset: z
        .enum([
            "default",
            "writing-never",
            "writing-5-days",
            "weekly-one",
            "weekly-three",
            "trial-3-days",
            "trial-1-day",
            "progress-15",
            "progress-60",
            "waitlist-early",
            "waitlist-later",
        ])
        .optional()
        .default("default"),
});

export type EmailReviewRequest = z.infer<typeof EmailReviewRequestSchema>;
