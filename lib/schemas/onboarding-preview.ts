import { z } from "zod";
import { INSIGHT_TAG_TYPES } from "@/lib/constants/insight-tag-types";
import { PATTERN_TYPE_CODES } from "@/lib/constants/pattern-types";

export const onboardingPreviewRequestSchema = z.object({
    entry_id: z.uuid(),
    content: z.string().min(10),
    insight: z.string(),
    tags: z.array(z.enum(INSIGHT_TAG_TYPES)),
});

export const onboardingPreviewSchema = z.object({
    pattern: z.object({
        type: z.enum(PATTERN_TYPE_CODES),
        title: z.string(),
        description: z.string(),
        question: z.string(),
    }),
    progress: z.object({
        headline: z.string(),
        whatsOnRepeat: z.string(),
        experiment: z.string(),
    }),
});

export type OnboardingPreview = z.infer<typeof onboardingPreviewSchema>;
export type OnboardingPreviewPattern = OnboardingPreview["pattern"];
export type OnboardingPreviewProgress = OnboardingPreview["progress"];
