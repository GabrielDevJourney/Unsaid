import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/ai/embeddings";
import {
    generateProgressInsight,
    type WeeklyPatternContext,
} from "@/lib/ai/generate-progress-insight";
import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";
import {
    getEntryDatesByIds,
    searchEntriesByEmbedding,
} from "@/lib/entries/repo";
import { findEntryInsightsByEntryIds } from "@/lib/entry-insights/repo";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { findWeeklyPatternsForDateRange } from "@/lib/weekly-insights/repo";
import type {
    CreateProgressInsightPayload,
    EntryMinimal,
    EntryMinimalWithSimilarity,
    ProgressInsight,
    ServiceResult,
} from "@/types";

// SupabaseClient alias accepted by both server and admin clients
type DbClient = SupabaseClient;
const INITIAL_PAGE_SIZE = 20; // must match PAGE_SIZE in progress-view.tsx

import {
    countUnviewedProgressInsights,
    findLatestProgressInsight,
    findProgressInsightById,
    findProgressInsightsPaginated,
    findRecentEntries,
    findUserProgress,
    insertProgressInsight,
    updateProgressInsightViewStatus,
    updateUserProgressAfterInsight,
} from "./repo";

export { PROGRESS_TRIGGER_INTERVAL };

export const getUnviewedProgressInsightsCount = async (
    supabase: DbClient,
): Promise<ServiceResult<number>> => {
    const { count, error } = await countUnviewedProgressInsights(supabase);
    if (error) {
        console.error("Failed to get unviewed progress count:", error);
        return { error: "Failed to get unviewed progress count" };
    }
    return { data: count };
};

export const markProgressInsightViewed = async (
    supabase: DbClient,
    insightId: string,
): Promise<void> => {
    await updateProgressInsightViewStatus(supabase, insightId);
};

/** Number of related past entries to include for context */
const RELATED_ENTRIES_LIMIT = 7;

/** Similarity threshold for finding related entries (lower = more matches) */
const SIMILARITY_THRESHOLD = 0.3;

/**
 * Check if a progress insight should be generated.
 *
 * Triggers when:
 * 1. User has at least 15 entries
 * 2. Entries since last progress insight >= 15
 */
export const shouldTriggerProgressInsight = async (
    userId: string,
): Promise<
    ServiceResult<{
        shouldTrigger: boolean;
        totalEntries: number;
        entryCountAtLastProgress: number;
    }>
> => {
    const supabase = createSupabaseAdmin();

    const { data: progress, error: progressError } = await findUserProgress(
        supabase,
        userId,
    );

    if (progressError) {
        // PGRST116 = no rows (user has no progress record yet)
        if (progressError.code === "PGRST116") {
            return {
                data: {
                    shouldTrigger: false,
                    totalEntries: 0,
                    entryCountAtLastProgress: 0,
                },
            };
        }
        console.error("Failed to fetch user progress:", progressError);
        throw progressError;
    }

    if (!progress) {
        return {
            data: {
                shouldTrigger: false,
                totalEntries: 0,
                entryCountAtLastProgress: 0,
            },
        };
    }

    const entriesSinceLastProgress =
        progress.total_entries - progress.entry_count_at_last_progress;

    const shouldTrigger =
        progress.total_entries >= PROGRESS_TRIGGER_INTERVAL &&
        entriesSinceLastProgress >= PROGRESS_TRIGGER_INTERVAL;

    return {
        data: {
            shouldTrigger,
            totalEntries: progress.total_entries,
            entryCountAtLastProgress: progress.entry_count_at_last_progress,
        },
    };
};

/**
 * Generate and save a progress insight.
 *
 * Flow:
 * 1. Fetch last 15 entries
 * 2. Find semantically related past entries
 * 3. Enrich with entry insights (Tier 1 summaries + tags) and weekly patterns
 * 4. Generate structured JSON insight using AI
 * 5. Compute is_milestone, serialize, save to database
 * 6. Update user progress tracking
 *
 * Uses admin client (bypasses RLS - insights are system-created).
 *
 * Returns error for expected failures (not enough entries, AI failure).
 * Throws for unexpected DB errors.
 */
export const createProgressInsight = async (
    userId: string,
    payload?: CreateProgressInsightPayload,
): Promise<ServiceResult<ProgressInsight>> => {
    const supabase = createSupabaseAdmin();

    // Get recent entries if not provided in payload
    let recentEntries: EntryMinimal[];

    if (payload?.recentEntries && payload.recentEntries.length > 0) {
        recentEntries = payload.recentEntries;
    } else {
        const { data: entries, error: entriesError } = await findRecentEntries(
            supabase,
            userId,
            PROGRESS_TRIGGER_INTERVAL,
        );

        if (entriesError) {
            console.error("Failed to fetch recent entries:", entriesError);
            throw entriesError;
        }

        if (!entries || entries.length < PROGRESS_TRIGGER_INTERVAL) {
            return {
                error: `Not enough entries for progress insight (need ${PROGRESS_TRIGGER_INTERVAL}, have ${entries?.length ?? 0})`,
            };
        }

        recentEntries = entries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        }));
    }

    // Find related past entries using semantic search
    let relatedPastEntries: EntryMinimalWithSimilarity[] = [];

    if (payload?.relatedPastEntries) {
        relatedPastEntries = payload.relatedPastEntries;
    } else {
        relatedPastEntries = await findRelatedPastEntries(
            supabase,
            userId,
            recentEntries,
        );
    }

    // Enrich context with entry insights (Tier 1 summaries + tags)
    const entryInsights = await fetchEntryInsightsContext(
        supabase,
        recentEntries,
    );

    // Enrich context with weekly patterns in the date range
    const weeklyPatterns = await fetchWeeklyPatternsContext(
        supabase,
        userId,
        recentEntries,
    );

    // Generate progress insight using AI (structured JSON output)
    const aiOutput = await generateProgressInsight({
        recentEntries: recentEntries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        })),
        relatedPastEntries: relatedPastEntries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
            similarity: e.similarity,
        })),
        entryInsights,
        weeklyPatterns,
    });

    if (!aiOutput) {
        return { error: "AI failed to generate progress insight" };
    }

    // Map key_entry_numbers (1-indexed) to actual entry IDs
    const keyEntryIds = aiOutput.key_entry_numbers
        .map((n) => recentEntries[n - 1]?.id)
        .filter((id): id is string => id !== undefined);

    const content = JSON.stringify(aiOutput);

    // Save to database
    const { data: insight, error: insertError } = await insertProgressInsight(
        supabase,
        {
            userId,
            content,
            recentEntryIds: recentEntries.map((e) => e.id),
            relatedPastEntryIds: relatedPastEntries.map((e) => e.id),
            keyEntryIds,
        },
    );

    if (insertError) {
        console.error("Failed to insert progress insight:", insertError);
        throw insertError;
    }

    if (!insight) {
        throw new Error("Progress insight was not created");
    }

    // Update user progress tracking
    const { data: progress } = await findUserProgress(supabase, userId);
    if (progress) {
        await updateUserProgressAfterInsight(
            supabase,
            userId,
            progress.total_entries,
        );
    }

    return { data: insight };
};

/**
 * Get all progress insights + stats for the list page.
 * Caller (RSC page) provides supabase server client + userId from auth.
 */
export const getProgressInsightsPage = async (
    supabase: DbClient,
    userId: string,
): Promise<{
    insights: ProgressInsight[];
    totalInsights: number;
    totalEntries: number;
    entryCountAtLastProgress: number;
    hasMore: boolean;
}> => {
    const [insightsResult, progressResult] = await Promise.all([
        findProgressInsightsPaginated(supabase, userId, 1, INITIAL_PAGE_SIZE),
        findUserProgress(supabase, userId),
    ]);

    const progress = progressResult.data;
    const totalInsights = insightsResult.count ?? 0;
    return {
        insights: insightsResult.data,
        hasMore: totalInsights > INITIAL_PAGE_SIZE,
        totalInsights: totalInsights,
        totalEntries: progress?.total_entries ?? 0,
        entryCountAtLastProgress: progress?.entry_count_at_last_progress ?? 0,
    };
};

/**
 * Get a single progress insight + resolved key entry dates for the detail page.
 * Returns null if insight not found.
 * Caller (RSC page) provides supabase server client. RLS enforces ownership.
 */
export const getProgressInsightDetail = async (
    supabase: DbClient,
    insightId: string,
): Promise<{
    insight: ProgressInsight;
    keyEntryData: { id: string; entryNumber: number; createdAt: string }[];
} | null> => {
    const { data: insight } = await findProgressInsightById(
        supabase,
        insightId,
    );
    if (!insight) return null;

    // Determine key entry IDs: use stored key_entry_ids, or fall back to first/middle/last
    const keyIds = resolveKeyEntryIds(insight);

    const { data: entryDates } = await getEntryDatesByIds(supabase, keyIds);

    const dateMap = new Map(entryDates.map((e) => [e.id, e.createdAt]));

    const keyEntryData = keyIds
        .map((id) => ({
            id,
            entryNumber: insight.recentEntryIds.indexOf(id) + 1,
            createdAt: dateMap.get(id) ?? "",
        }))
        .filter((e) => e.createdAt !== "");

    return { insight, keyEntryData };
};

/**
 * Determine which entry IDs to show in the reference panel.
 * Uses key_entry_ids if available (new records), otherwise falls back
 * to first, middle, and last of recent_entry_ids (old records).
 */
const resolveKeyEntryIds = (insight: ProgressInsight): string[] => {
    if (insight.keyEntryIds && insight.keyEntryIds.length > 0) {
        return insight.keyEntryIds;
    }

    const ids = insight.recentEntryIds;
    if (ids.length === 0) return [];
    if (ids.length <= 3) return ids;

    const first = ids[0];
    const mid = ids[Math.floor(ids.length / 2)];
    const last = ids[ids.length - 1];

    return [...new Set([first, mid, last])];
};

/**
 * Fetch entry insight summaries for recent entries.
 * Returns context objects for the AI prompt.
 * Gracefully returns empty array if no insights are available.
 */
const fetchEntryInsightsContext = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    recentEntries: EntryMinimal[],
): Promise<{ entryIndex: number; summary: string; tags: string[] }[]> => {
    try {
        const entryIds = recentEntries.map((e) => e.id);
        const { data: insights } = await findEntryInsightsByEntryIds(
            supabase,
            entryIds,
        );

        if (!insights || insights.length === 0) return [];

        const entryIdToIndex = new Map(recentEntries.map((e, i) => [e.id, i]));

        return insights
            .map((insight) => {
                const index = entryIdToIndex.get(insight.entryId);
                if (index === undefined) return null;
                return {
                    entryIndex: index,
                    summary: insight.content,
                    tags: insight.tags,
                };
            })
            .filter(
                (
                    item,
                ): item is {
                    entryIndex: number;
                    summary: string;
                    tags: string[];
                } => item !== null,
            );
    } catch (error) {
        console.error(
            "[Progress] Failed to fetch entry insights for context:",
            error,
        );
        return [];
    }
};

/**
 * Fetch weekly patterns within the date range of the recent 15 entries.
 * Used to enrich the AI context with higher-level pattern summaries.
 */
const fetchWeeklyPatternsContext = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    recentEntries: EntryMinimal[],
): Promise<WeeklyPatternContext[]> => {
    if (recentEntries.length === 0) return [];

    try {
        const newestDate = recentEntries[0].createdAt;
        const oldestDate = recentEntries[recentEntries.length - 1].createdAt;

        const { data: patterns } = await findWeeklyPatternsForDateRange(
            supabase,
            userId,
            oldestDate,
            newestDate,
            3,
        );

        if (!patterns || patterns.length === 0) return [];

        return patterns
            .filter((p) => p.description)
            .map((p) => ({
                title: p.title,
                description: p.description,
            }));
    } catch (error) {
        console.error(
            "[Progress] Failed to fetch weekly patterns for context:",
            error,
        );
        return [];
    }
};

/**
 * Find past entries semantically related to recent entries.
 * Extracts themes from recent entries and searches older content.
 */
const findRelatedPastEntries = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    recentEntries: EntryMinimal[],
): Promise<EntryMinimalWithSimilarity[]> => {
    // Get the oldest recent entry date to exclude recent entries from search
    const oldestRecentDate = recentEntries.reduce((oldest, entry) => {
        const date = new Date(entry.createdAt);
        return date < oldest ? date : oldest;
    }, new Date());

    // Create a combined theme summary from recent entries
    const themeSummary = recentEntries
        .map((e) => e.content.slice(0, 500))
        .join(" ")
        .slice(0, 3000);

    try {
        const themeEmbedding = await generateEmbedding(themeSummary);

        const { data: relatedEntries, error } = await searchEntriesByEmbedding(
            supabase,
            userId,
            themeEmbedding,
            RELATED_ENTRIES_LIMIT + PROGRESS_TRIGGER_INTERVAL,
            SIMILARITY_THRESHOLD,
        );

        if (error || !relatedEntries) {
            console.error("Failed to find related entries:", error);
            return [];
        }

        const recentIds = new Set(recentEntries.map((e) => e.id));
        const pastEntries = relatedEntries
            .filter((e) => !recentIds.has(e.id))
            .filter((e) => new Date(e.createdAt) < oldestRecentDate)
            .slice(0, RELATED_ENTRIES_LIMIT);

        return pastEntries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
            similarity: e.similarity,
        }));
    } catch (embeddingError) {
        console.error("Failed to generate theme embedding:", embeddingError);
        return [];
    }
};

export const getProgressInsightsPaginated = async (
    supabase: DbClient,
    userId: string,
    page: number,
    pageSize: number,
): Promise<ServiceResult<{ insights: ProgressInsight[]; count: number }>> => {
    const { data, error, count } = await findProgressInsightsPaginated(
        supabase,
        userId,
        page,
        pageSize,
    );

    if (error) {
        console.error("Failed to fetch progress insights:", error);
        return { error: "Failed to fetch progress insights" };
    }

    return { data: { insights: data, count } };
};

export const getLatestProgressInsight = async (
    supabase: DbClient,
    userId: string,
): Promise<ServiceResult<ProgressInsight | null>> => {
    const { data, error } = await findLatestProgressInsight(supabase, userId);

    if (error?.code === "PGRST116") return { data: null };
    if (error) {
        console.error("Failed to fetch latest progress insight:", error);
        return { error: "Failed to fetch latest progress insight" };
    }

    return { data };
};
