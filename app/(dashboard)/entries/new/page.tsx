import { auth } from "@clerk/nextjs/server";
import { EntryEditorPage } from "@/components/entries/entry-editor-page";
import { EntryGate } from "@/components/entries/entry-gate";
import { getTotalInsightsCount } from "@/lib/entry-insights/repo";
import { getLatestProgressInsight } from "@/lib/progress-insights/repo";
import {
    getPatternReflectionContext,
    getProgressReflectionContext,
} from "@/lib/reflections/service";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserProgress } from "@/lib/users/repo";
import {
    getTotalPatternsCount,
    getWeeklyInsightWithPatternsPaginated,
} from "@/lib/weekly-insights/repo";

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
        { data: progress },
        { count: patternsCount },
        { count: insightsCount },
        { data: latestProgressInsight },
        { data: latestWeeklyInsights },
    ] = await Promise.all([
        canUserWriteEntry(supabase),
        getUserProgress(supabase),
        getTotalPatternsCount(supabase),
        getTotalInsightsCount(supabase),
        userId
            ? getLatestProgressInsight(supabase, userId)
            : Promise.resolve({ data: null, error: null }),
        getWeeklyInsightWithPatternsPaginated(supabase, null, 1),
    ]);

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
