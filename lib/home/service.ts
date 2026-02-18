import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserEntriesWithInsights } from "@/lib/entries/service";
import { getUserProgress } from "@/lib/users/repo";
import { getWeeklyInsightsCount } from "@/lib/weekly-insights/repo";
import type { EntryWithInsight } from "@/types";

export interface HomePageData {
    entries: EntryWithInsight[];
    asideTotalEntries: number;
    weeklyInsightsCount: number;
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
        { count: weeklyCount },
    ] = await Promise.all([
        getUserEntriesWithInsights(supabase),
        getUserProgress(supabase),
        getWeeklyInsightsCount(supabase),
    ]);

    const entries = entriesData ?? [];

    return {
        entries,
        asideTotalEntries: progressData?.totalEntries ?? entries.length,
        weeklyInsightsCount: weeklyCount,
        entryDates: entries.map((entry) => entry.createdAt),
    };
};
