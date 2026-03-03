import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserEntriesWithInsights } from "@/lib/entries/service";
import { getUserProgress } from "@/lib/users/repo";
import { getTotalPatternsCount } from "@/lib/weekly-insights/repo";
import type { EntryWithInsight } from "@/types";

export interface HomePageData {
    entries: EntryWithInsight[];
    totalEntriesAllTime: number;
    totalPatternsCount: number;
    entryDates: string[];
}

/**
 * Aggregate all data needed to render the home page.
 * Three independent queries run in parallel.
 * Supabase client is injected by the caller — keeps the service testable
 * and consistent with every other service in lib/.
 */
export const getHomePageData = async (
    supabase: SupabaseClient,
): Promise<HomePageData> => {
    const [
        { data: entriesData },
        { data: progressData },
        { count: patternsCount },
    ] = await Promise.all([
        getUserEntriesWithInsights(supabase),
        getUserProgress(supabase),
        getTotalPatternsCount(supabase),
    ]);

    const entries = entriesData ?? [];

    return {
        entries,
        totalEntriesAllTime: progressData?.totalEntries ?? entries.length,
        totalPatternsCount: patternsCount,
        entryDates: entries.map((entry) => entry.createdAt),
    };
};
