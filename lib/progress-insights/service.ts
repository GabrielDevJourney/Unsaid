import { generateEmbedding } from "@/lib/ai/embeddings";
import { generateProgressInsight } from "@/lib/ai/generate-progress-insight";
import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";
import { searchEntriesByEmbedding } from "@/lib/entries/repo";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type {
    CreateProgressInsightPayload,
    EntryMinimal,
    EntryMinimalWithSimilarity,
    ProgressInsight,
    ServiceResult,
} from "@/types";
import {
    getRecentEntries,
    getUserProgress,
    insertProgressInsight,
    updateUserProgressAfterInsight,
} from "./repo";

export { PROGRESS_TRIGGER_INTERVAL };

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
): Promise<ServiceResult<{ shouldTrigger: boolean; totalEntries: number }>> => {
    const supabase = createSupabaseAdmin();

    const { data: progress, error: progressError } = await getUserProgress(
        supabase,
        userId,
    );

    if (progressError) {
        // PGRST116 = no rows (user has no progress record yet)
        if (progressError.code === "PGRST116") {
            return { data: { shouldTrigger: false, totalEntries: 0 } };
        }
        console.error("Failed to fetch user progress:", progressError);
        throw progressError;
    }

    if (!progress) {
        return { data: { shouldTrigger: false, totalEntries: 0 } };
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
        },
    };
};

/**
 * Generate and save a progress insight.
 *
 * Flow:
 * 1. Fetch last 15 entries
 * 2. Find semantically related past entries
 * 3. Generate insight using AI
 * 4. Save to database
 * 5. Update user progress tracking
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
        const { data: entries, error: entriesError } = await getRecentEntries(
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

    // Generate progress insight using AI
    const insightContent = await generateProgressInsight({
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
    });

    if (!insightContent) {
        return { error: "AI failed to generate progress insight" };
    }

    // Save to database
    const { data: insight, error: insertError } = await insertProgressInsight(
        supabase,
        {
            userId,
            content: insightContent,
            recentEntryIds: recentEntries.map((e) => e.id),
            relatedPastEntryIds: relatedPastEntries.map((e) => e.id),
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
    const { data: progress } = await getUserProgress(supabase, userId);
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
    // Use first ~500 chars from each entry to capture key themes
    const themeSummary = recentEntries
        .map((e) => e.content.slice(0, 500))
        .join(" ")
        .slice(0, 3000); // Limit total length for embedding

    try {
        // Generate embedding for the theme summary
        const themeEmbedding = await generateEmbedding(themeSummary);

        // Search for related entries before the recent period
        const { data: relatedEntries, error } = await searchEntriesByEmbedding(
            supabase,
            userId,
            themeEmbedding,
            RELATED_ENTRIES_LIMIT + PROGRESS_TRIGGER_INTERVAL, // Get extra to filter
            SIMILARITY_THRESHOLD,
        );

        if (error || !relatedEntries) {
            console.error("Failed to find related entries:", error);
            return [];
        }

        console.log(
            `[Progress] Semantic search found ${relatedEntries.length} entries above threshold ${SIMILARITY_THRESHOLD}`,
        );

        // Filter out recent entries (those in the last 15)
        const recentIds = new Set(recentEntries.map((e) => e.id));
        const pastEntries = relatedEntries
            .filter((e) => !recentIds.has(e.id))
            .filter((e) => new Date(e.createdAt) < oldestRecentDate)
            .slice(0, RELATED_ENTRIES_LIMIT);

        console.log(
            `[Progress] After filtering recent entries: ${pastEntries.length} past entries found`,
        );

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
