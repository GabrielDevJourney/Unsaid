import type { SupabaseClient } from "@supabase/supabase-js";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { getEntryWithInsightById } from "@/lib/entries/repo";
import type {
    OnboardingPreviewPattern,
    OnboardingPreviewProgress,
} from "@/lib/schemas/onboarding-preview";
import type { ServiceResult } from "@/types";
import { getOnboardingPreview } from "./repo";

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
    const previewResult = await getOnboardingPreview(supabase);

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
