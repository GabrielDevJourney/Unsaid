import { anthropic } from "@ai-sdk/anthropic";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateObject } from "ai";
import { z } from "zod";
import { generateInitialPersonaSummary } from "@/lib/ai/generate-persona-summary";
import { loadPrompt, loadSystemPrompt } from "@/lib/ai/prompts";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { findEntryWithInsightById } from "@/lib/entries/repo";
import { findPersona } from "@/lib/persona/repo";
import { savePersonaSummary } from "@/lib/persona/service";
import type {
    OnboardingPreview,
    OnboardingPreviewPattern,
    OnboardingPreviewProgress,
} from "@/lib/schemas/onboarding-preview";
import { onboardingPreviewSchema } from "@/lib/schemas/onboarding-preview";
import {
    Q1_LABEL_MAP,
    Q2_LABEL_MAP,
    Q3_LABEL_MAP,
    Q4_LABEL_MAP,
} from "@/lib/schemas/persona";
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
    const entryResult = await findEntryWithInsightById(supabase, entryId);

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

export const getEntryForOnboardingPreview = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<
    ServiceResult<{
        content: string;
        insight: { content: string; tags: InsightTagType[] };
    }>
> => {
    const { data: entry, error } = await findEntryWithInsightById(
        supabase,
        entryId,
    );
    if (error || !entry || !entry.entryInsight) {
        return { error: "entry_insight_not_found" };
    }
    return {
        data: {
            content: entry.content,
            insight: {
                content: entry.entryInsight.content,
                tags: entry.entryInsight.tags as InsightTagType[],
            },
        },
    };
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

    // Fire-and-forget: generate initial persona summary now that we have
    // the first entry + insight. Only runs if persona exists and has no summary yet.
    void generateAndSaveInitialPersonaSummary(
        supabase,
        userId,
        payload.content,
        payload.insight,
    );

    return { data: object };
};

const generateAndSaveInitialPersonaSummary = async (
    supabase: SupabaseClient,
    userId: string,
    entryContent: string,
    insight: string,
): Promise<void> => {
    const { data: persona } = await findPersona(supabase, userId);
    if (!persona || persona.summary) return;

    const summary = await generateInitialPersonaSummary({
        displayName: persona.displayName,
        q1Answer: Q1_LABEL_MAP[persona.q1Answer] ?? persona.q1Answer,
        q2Answer: Q2_LABEL_MAP[persona.q2Answer] ?? persona.q2Answer,
        q3Answer: Q3_LABEL_MAP[persona.q3Answer] ?? persona.q3Answer,
        q4Answer: Q4_LABEL_MAP[persona.q4Answer] ?? persona.q4Answer,
        firstEntryContent: entryContent,
        firstInsight: insight,
    });

    if (!summary) return;

    const { error } = await savePersonaSummary(supabase, userId, summary);
    if (error) {
        console.error("Failed to save initial persona summary:", error);
    }
};
