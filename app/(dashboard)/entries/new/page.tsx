import { auth } from "@clerk/nextjs/server";
import { EntryEditorPage } from "@/components/entries/entry-editor-page";
import { EntryGate } from "@/components/entries/entry-gate";
import { getTotalInsightsCount } from "@/lib/entry-insights/repo";
import { getLatestProgressInsight } from "@/lib/progress-insights/repo";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserProgress } from "@/lib/users/repo";
import {
    getTotalPatternsCount,
    getWeeklyInsightWithPatternsPaginated,
} from "@/lib/weekly-insights/repo";

const NewEntryPage = async () => {
    const { userId } = await auth();
    const supabase = await createSupabaseServer();

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

    return <EntryEditorPage />;
};

export default NewEntryPage;
