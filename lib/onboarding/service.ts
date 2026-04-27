import { anthropic } from "@ai-sdk/anthropic";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateObject } from "ai";
import { z } from "zod";
import { loadPrompt, loadSystemPrompt } from "@/lib/ai/prompts";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { getEntryWithInsightById } from "@/lib/entries/repo";
import type {
    OnboardingPreview,
    OnboardingPreviewPattern,
    OnboardingPreviewProgress,
} from "@/lib/schemas/onboarding-preview";
import { onboardingPreviewSchema } from "@/lib/schemas/onboarding-preview";
import type { ServiceResult } from "@/types";
import { createOnboardingPreview, findOnboardingPreview } from "./repo";

export interface OnboardingEntrySnapshot {
    entryId: string;
    entryContent: string;
    insightText: string;
    insightTags: InsightTagType[];
    preview?: {
        pattern: OnboardingPreviewPattern;
        progress: OnboardingPreviewProgress;
    };
}

/**
 * Fetch the onboarding snapshot driven by `onboarding_previews`.
 * If no preview row exists the user hasn't completed step 2 — return null
 * so the wizard starts fresh, regardless of whether entries already exist.
 * Used to restore wizard state on refresh/navigation without re-generating AI.
 */
export const getOnboardingEntrySnapshot = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<OnboardingEntrySnapshot | null>> => {
    const previewResult = await findOnboardingPreview(supabase);

    if (!previewResult.data) return { data: null };

    const { entryId, pattern, progress } = previewResult.data;
    const entryResult = await getEntryWithInsightById(supabase, entryId);

    if (
        entryResult.error ||
        !entryResult.data ||
        !entryResult.data.entryInsight
    ) {
        return { data: null };
    }

    const insight = entryResult.data.entryInsight;
    const entry = entryResult.data;

    return {
        data: {
            entryId: entry.id,
            entryContent: entry.content,
            insightText: insight.content,
            insightTags: insight.tags as InsightTagType[],
            preview: { pattern, progress },
        },
    };
};

export const saveOnboardingPreview = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
    pattern: OnboardingPreviewPattern,
    progress: OnboardingPreviewProgress,
): Promise<ServiceResult<null>> => {
    const { error } = await createOnboardingPreview(
        supabase,
        userId,
        entryId,
        pattern,
        progress,
    );
    if (error) {
        console.error("Failed to save onboarding preview:", error);
        return { error: "Failed to save preview" };
    }
    return { data: null };
};

export const generateOnboardingPreview = async (
    supabase: SupabaseClient,
    userId: string,
    payload: {
        entry_id: string;
        content: string;
        insight: string;
        tags: InsightTagType[];
    },
): Promise<ServiceResult<OnboardingPreview>> => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadPrompt("tasks/onboarding-preview.md"),
    ]);

    const promptBase = `${taskPrompt}\n\n---\n\nEntry:\n${payload.content}\n\n---\n\nInsight already generated:\n${payload.insight}\n\nTags: ${payload.tags.join(", ")}`;

    const sharedArgs = {
        model: anthropic("claude-haiku-4-5"),
        system: systemPrompt,
    };

    const [{ object: patternResult }, { object: progressResult }] =
        await Promise.all([
            generateObject({
                ...sharedArgs,
                schema: z.object({
                    pattern: onboardingPreviewSchema.shape.pattern,
                }),
                prompt: `${promptBase}\n\nGenerate ONLY the "pattern" field.`,
            }),
            generateObject({
                ...sharedArgs,
                schema: z.object({
                    progress: onboardingPreviewSchema.shape.progress,
                }),
                prompt: `${promptBase}\n\nGenerate ONLY the "progress" field.`,
            }),
        ]);

    const object = {
        pattern: patternResult.pattern,
        progress: progressResult.progress,
    };

    const saveResult = await saveOnboardingPreview(
        supabase,
        userId,
        payload.entry_id,
        object.pattern,
        object.progress,
    );

    if (saveResult.error) {
        console.warn("Failed to save onboarding preview");
    }

    return { data: object };
};
