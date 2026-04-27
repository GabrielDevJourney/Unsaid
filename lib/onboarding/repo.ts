import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    OnboardingPreviewPattern,
    OnboardingPreviewProgress,
} from "@/lib/schemas/onboarding-preview";

export interface OnboardingPreviewRow {
    pattern: OnboardingPreviewPattern;
    progress: OnboardingPreviewProgress;
    entryId: string;
}

export const createOnboardingPreview = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
    pattern: OnboardingPreviewPattern,
    progress: OnboardingPreviewProgress,
): Promise<{ error: Error | null }> => {
    const { error } = await supabase.from("onboarding_previews").upsert({
        user_id: userId,
        entry_id: entryId,
        pattern,
        progress,
    });

    return { error: error as Error | null };
};

export const findOnboardingPreview = async (
    supabase: SupabaseClient,
): Promise<{ data: OnboardingPreviewRow | null; error: Error | null }> => {
    const { data, error } = await supabase
        .from("onboarding_previews")
        .select("entry_id, pattern, progress")
        .single();

    if (error || !data) return { data: null, error: error as Error | null };

    return {
        data: {
            entryId: data.entry_id,
            pattern: data.pattern as OnboardingPreviewPattern,
            progress: data.progress as OnboardingPreviewProgress,
        },
        error: null,
    };
};
