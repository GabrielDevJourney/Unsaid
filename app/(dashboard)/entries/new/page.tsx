import { auth } from "@clerk/nextjs/server";
import { EntryEditorPage } from "@/components/entries/entry-editor-page";
import { EntryGate } from "@/components/entries/entry-gate";
import { getTotalInsightsCount } from "@/lib/entry-insights/service";
import { getLatestProgressInsight } from "@/lib/progress-insights/service";
import {
    getPatternReflectionContext,
    getProgressReflectionContext,
} from "@/lib/reflections/service";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserProgress } from "@/lib/users/service";
import {
    getTotalPatternsCount,
    getWeeklyInsightWithPatternsPaginated,
} from "@/lib/weekly-insights/service";
import { isServiceError } from "@/types";

const NewEntryPage = async ({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) => {
    const { userId } = await auth();
    const supabase = await createSupabaseServer();

    const params = await searchParams;
    const initialSuggestion = params.suggestion
        ? decodeURIComponent(params.suggestion)
        : null;
    const sourceType = params.sourceType ?? null;
    const sourceId = params.sourceId ?? null;

    const [
        canWrite,
        progressResult,
        patternsCountResult,
        insightsCountResult,
        latestProgressInsightResult,
        latestWeeklyInsightsResult,
    ] = await Promise.all([
        canUserWriteEntry(supabase),
        getUserProgress(supabase),
        getTotalPatternsCount(supabase),
        getTotalInsightsCount(supabase),
        userId
            ? getLatestProgressInsight(supabase, userId)
            : Promise.resolve({ data: null }),
        getWeeklyInsightWithPatternsPaginated(supabase, null, 1),
    ]);

    const progress = isServiceError(progressResult)
        ? null
        : progressResult.data;
    const patternsCount = isServiceError(patternsCountResult)
        ? 0
        : patternsCountResult.data;
    const insightsCount = isServiceError(insightsCountResult)
        ? 0
        : insightsCountResult.data;
    const latestProgressInsight = isServiceError(latestProgressInsightResult)
        ? null
        : latestProgressInsightResult.data;
    const latestWeeklyInsights = isServiceError(latestWeeklyInsightsResult)
        ? []
        : latestWeeklyInsightsResult.data.insights;

    if (!canWrite && (progress?.totalEntries ?? 0) >= 15) {
        const patterns = latestWeeklyInsights?.[0]?.patterns ?? [];
        const latestPattern = patterns[0] ?? null;
        const secondLatestPattern = patterns[1] ?? null;

        return (
            <EntryGate
                totalEntries={progress?.totalEntries ?? 15}
                patternsCount={patternsCount}
                insightsCount={insightsCount}
                latestProgressInsight={latestProgressInsight}
                latestPattern={latestPattern}
                secondLatestPattern={secondLatestPattern}
            />
        );
    }

    let reflectionContext: string | null = null;
    if (sourceType && sourceId && userId) {
        reflectionContext =
            sourceType === "pattern"
                ? await getPatternReflectionContext(supabase, userId, sourceId)
                : await getProgressReflectionContext(
                      supabase,
                      userId,
                      sourceId,
                  );
        if (reflectionContext === "") reflectionContext = null;
    }

    return (
        <EntryEditorPage
            initialSuggestion={initialSuggestion}
            reflectionContext={reflectionContext}
            sourceType={sourceType}
            sourceId={sourceId}
        />
    );
};

export default NewEntryPage;
