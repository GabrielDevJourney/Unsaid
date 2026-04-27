import type { SupabaseClient } from "@supabase/supabase-js";
import {
    getEntriesWithInsightsPaginated,
    getEntryDates,
} from "@/lib/entries/repo";
import { getUserProgress } from "@/lib/users/repo";
import { countPatterns } from "@/lib/weekly-insights/repo";
import type { EntryWithInsight } from "@/types";

const INITIAL_PAGE_SIZE = 20;

export interface HomePageData {
    entries: EntryWithInsight[];
    hasMore: boolean;
    totalEntriesAllTime: number;
    totalPatternsCount: number;
    entryDates: string[];
}

/**
 * Aggregate all data needed to render the home page.
 * Entries are paginated (first page only) — subsequent pages fetched client-side.
 * Entry dates are fetched separately (lightweight) to keep the calendar accurate
 * across all entries regardless of what page is loaded.
 */
export const getHomePageData = async (
    supabase: SupabaseClient,
): Promise<HomePageData> => {
    const [
        { data: entriesData, count: totalEntryCount, error: entriesError },
        { data: progressData, error: progressError },
        { data: patternsCount, error: patternsError },
        { data: entryDates, error: datesError },
    ] = await Promise.all([
        getEntriesWithInsightsPaginated(supabase, 1, INITIAL_PAGE_SIZE),
        getUserProgress(supabase),
        countPatterns(supabase),
        getEntryDates(supabase),
    ]);

    if (entriesError) throw entriesError;
    if (progressError) throw progressError;
    if (patternsError) throw patternsError;
    if (datesError) throw datesError;

    const entries = entriesData ?? [];
    const total = totalEntryCount ?? 0;

    return {
        entries,
        hasMore: total > INITIAL_PAGE_SIZE,
        totalEntriesAllTime: progressData?.totalEntries ?? total,
        totalPatternsCount: patternsCount,
        entryDates: entryDates ?? [],
    };
};
