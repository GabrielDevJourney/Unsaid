import type { SupabaseClient } from "@supabase/supabase-js";
import { generateUpdatedPersonaSummary } from "@/lib/ai/generate-persona-summary";
import { generateWeeklyInsight } from "@/lib/ai/generate-weekly-insight";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import { MIN_ENTRIES_FOR_WEEKLY_INSIGHT } from "@/lib/constants";
import type { PatternTypeCode } from "@/lib/constants/pattern-types";
import { getWeekRange, getWeekStart } from "@/lib/date-utils";
import { sendWeeklyPatternsEmail } from "@/lib/email/service";
import { findAllEntriesByDateRange } from "@/lib/entries/repo";
import { decryptEntryContent } from "@/lib/entries/transformers";
import { countEntryInsightsByUserId } from "@/lib/entry-insights/repo";
import { findPersona } from "@/lib/persona/repo";
import { savePersonaSummary } from "@/lib/persona/service";
import { findUserProgress } from "@/lib/progress-insights/repo";
import type { Pattern } from "@/lib/schemas/weekly-insight";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { findUserForWeeklyEmail } from "@/lib/users/repo";
import type {
    CreateWeeklyInsightPayload,
    ServiceResult,
    WeeklyInsightPattern,
    WeeklyInsightWithPatterns,
} from "@/types";
import { generateEmbedding } from "../ai/embeddings";
import {
    countNewPatterns,
    countPatterns,
    createWeeklyInsightPatterns,
    findPatternById,
    findWeeklyInsightWithPatternsByWeekStart,
    findWeeklyInsightWithPatternsPaginated,
    insertWeeklyInsight,
    updatePatternViewStatus,
} from "./repo";

export { getWeekRange, getWeekStart };

/** Result of processing weekly insights for all users */
export interface WeeklyInsightsBatchResult {
    weekStart: string;
    processed: number;
    success: number;
    skipped: number;
    failed: number;
    emailsSent: number;
    emailsFailed: number;
    errors: string[];
}

/** Entry shape from database query */
interface EntryRow {
    id: string;
    user_id: string;
    content_iv: string | null;
    content_tag: string | null;
    encrypted_content: string | null;
    created_at: string;
}

/** Aggregated data needed to compose the weekly patterns email. */
interface WeeklyEmailContext {
    email: string;
    username: string | null;
    notifyWeeklyPatterns: boolean;
    totalEntries: number;
    insightsCount: number;
    patterns: WeeklyInsightPattern[];
}

/**
 * Process weekly insights for all users with entries in the given week.
 * Used by cron job.
 */
export const processWeeklyInsightsForAllUsers = async (): Promise<
    ServiceResult<WeeklyInsightsBatchResult>
> => {
    const supabase = createSupabaseAdmin();

    const today = new Date();
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const weekStart = getWeekStart(lastWeekDate);
    const { start, end } = getWeekRange(weekStart);

    const { data: entries, error: entriesError } =
        await findAllEntriesByDateRange(
            supabase,
            start.toISOString(),
            end.toISOString(),
        );

    if (entriesError) {
        console.error("Failed to fetch entries:", entriesError);
        throw entriesError;
    }

    if (!entries || entries.length === 0) {
        return {
            data: {
                weekStart,
                processed: 0,
                success: 0,
                skipped: 0,
                failed: 0,
                emailsSent: 0,
                emailsFailed: 0,
                errors: [],
            },
        };
    }

    const entriesByUser = groupEntriesByUser(entries);
    return {
        data: await runWeeklyInsightBatch(supabase, weekStart, entriesByUser),
    };
};

/** Iterate over grouped entries and process each user's weekly insight. */
const runWeeklyInsightBatch = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    weekStart: string,
    entriesByUser: Record<string, EntryRow[]>,
): Promise<WeeklyInsightsBatchResult> => {
    const results: WeeklyInsightsBatchResult = {
        weekStart,
        processed: 0,
        success: 0,
        skipped: 0,
        failed: 0,
        emailsSent: 0,
        emailsFailed: 0,
        errors: [],
    };

    for (const [userId, userEntries] of Object.entries(entriesByUser)) {
        results.processed++;

        if (userEntries.length < MIN_ENTRIES_FOR_WEEKLY_INSIGHT) {
            results.skipped++;
            continue;
        }

        const userResult = await processUserWeeklyInsight(
            supabase,
            userId,
            weekStart,
            userEntries,
        );

        if (userResult.success) {
            results.success++;
            if (userResult.emailSent) {
                results.emailsSent++;
            } else if (userResult.emailError) {
                results.emailsFailed++;
            }
        } else {
            results.failed++;
            if (userResult.error) {
                results.errors.push(`User ${userId}: ${userResult.error}`);
            }
        }
    }

    return results;
};

/** Group entries by user_id. */
const groupEntriesByUser = (
    entries: EntryRow[],
): Record<string, EntryRow[]> => {
    return entries.reduce(
        (acc, entry) => {
            if (!acc[entry.user_id]) {
                acc[entry.user_id] = [];
            }
            acc[entry.user_id].push(entry);
            return acc;
        },
        {} as Record<string, EntryRow[]>,
    );
};

/** Process weekly insight for a single user and send email. */
const processUserWeeklyInsight = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    weekStart: string,
    entries: EntryRow[],
): Promise<{
    success: boolean;
    error?: string;
    emailSent?: boolean;
    emailError?: string;
}> => {
    try {
        const { data: persona } = await findPersona(supabase, userId);
        const personaContext =
            buildPersonaContext(persona ?? null) || undefined;

        const decryptedEntries = entries.map((e) => ({
            id: e.id,
            content: decryptEntryContent({
                encrypted_content: e.encrypted_content ?? "",
                content_iv: e.content_iv ?? "",
                content_tag: e.content_tag ?? "",
            }),
            createdAt: e.created_at,
        }));

        const result = await createWeeklyInsight(
            userId,
            {
                weekStart,
                entryIds: entries.map((e) => e.id),
                entries: decryptedEntries,
            },
            personaContext,
        );

        if ("error" in result && result.error) {
            return { success: false, error: result.error };
        }

        // Fire-and-forget: update persona summary with weekly evidence
        if (persona?.summary) {
            const patterns = result.data?.patterns ?? [];
            void updatePersonaSummaryFromWeekly(
                supabase,
                userId,
                persona.displayName,
                persona.summary,
                decryptedEntries.map((e) => e.content),
                patterns.map((p) => ({
                    title: p.title,
                    description: p.description,
                })),
            );
        }

        const emailResult = await sendWeeklyInsightEmail(
            supabase,
            userId,
            result.data?.patterns ?? [],
        );

        return {
            success: true,
            emailSent: emailResult.sent,
            emailError: emailResult.error,
        };
    } catch (error) {
        console.error(`Unexpected error for user ${userId}:`, error);
        return { success: false, error: "Unexpected error" };
    }
};

const updatePersonaSummaryFromWeekly = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    displayName: string,
    currentSummary: string,
    recentEntries: string[],
    weeklyPatterns: { title: string; description: string }[],
): Promise<void> => {
    const newSummary = await generateUpdatedPersonaSummary({
        currentSummary,
        displayName,
        recentEntries,
        weeklyPatterns,
    });
    if (!newSummary) return;
    const { error } = await savePersonaSummary(supabase, userId, newSummary);
    if (error) {
        console.error("Failed to update persona summary after weekly:", error);
    }
};

/** Fetch all data needed to compose the weekly patterns email. Returns null if user not found. */
const fetchWeeklyEmailContext = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
): Promise<WeeklyEmailContext | null> => {
    const [userResult, progressResult, insightsResult, weeklyInsightResult] =
        await Promise.all([
            findUserForWeeklyEmail(supabase, userId),
            findUserProgress(supabase, userId),
            countEntryInsightsByUserId(supabase, userId),
            findWeeklyInsightWithPatternsByWeekStart(
                supabase,
                userId,
                getWeekStart(new Date()),
            ),
        ]);

    if (!userResult.data?.email) return null;

    return {
        email: userResult.data.email,
        username: userResult.data.username,
        notifyWeeklyPatterns: userResult.data.notifyWeeklyPatterns,
        totalEntries: progressResult.data?.total_entries ?? 0,
        insightsCount: insightsResult.count,
        patterns: (weeklyInsightResult.data?.patterns ?? []).slice(0, 3),
    };
};

/** Send weekly insight email to user. */
const sendWeeklyInsightEmail = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    _patterns: WeeklyInsightPattern[],
): Promise<{ sent: boolean; error?: string }> => {
    try {
        const ctx = await fetchWeeklyEmailContext(supabase, userId);

        if (!ctx) return { sent: false, error: "User email not found" };
        if (!ctx.notifyWeeklyPatterns) return { sent: false };
        if (ctx.patterns.length === 0) return { sent: false };

        const emailResult = await sendWeeklyPatternsEmail(
            ctx.email,
            ctx.username ?? "",
            {
                patternCount: ctx.patterns.length,
                entryCount: ctx.totalEntries,
                insightsCount: ctx.insightsCount,
                patterns: ctx.patterns.map((p) => ({
                    title: p.title,
                    patternType: p.patternType as PatternTypeCode,
                })),
            },
        );

        return { sent: emailResult.success, error: emailResult.error };
    } catch (error) {
        console.error(`Email failed for ${userId}:`, error);
        return { sent: false, error: "Email send failed" };
    }
};

/** Generate and attach embeddings to all patterns in parallel. */
const attachEmbeddingsToPatterns = async (
    patterns: Pattern[],
): Promise<(Pattern & { embedding: string })[]> => {
    return Promise.all(
        patterns.map(async (p) => {
            const contentForEmbedding = `${p.title}\n${p.description}\n${p.question ?? ""}\n${p.suggested_experiment ?? ""}`;
            const embedding = await generateEmbedding(contentForEmbedding);
            return { ...p, embedding };
        }),
    );
};

/**
 * Generate and save weekly insight with patterns (insight cards).
 *
 * Flow:
 * 1. Generate patterns using AI
 * 2. Save weekly insight record
 * 3. Attach embeddings and save pattern cards
 *
 * Uses admin client (bypasses RLS - insights are system-created).
 * Returns error for expected failures. Throws for unexpected DB errors.
 */
export const createWeeklyInsight = async (
    userId: string,
    payload: CreateWeeklyInsightPayload,
    personaContext?: string,
): Promise<ServiceResult<WeeklyInsightWithPatterns>> => {
    const supabase = createSupabaseAdmin();

    if (payload.entries.length < 2) {
        return { error: "Not enough entries for weekly insight (minimum 2)" };
    }

    const patterns = await generateWeeklyInsight(
        payload.entries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        })),
        personaContext,
    );

    if (patterns.length === 0) {
        return { error: "AI failed to identify patterns" };
    }

    const { data: weeklyInsight, error: insertError } =
        await insertWeeklyInsight(supabase, {
            userId,
            weekStart: payload.weekStart,
            entryIds: payload.entryIds,
        });

    if (insertError) {
        console.error("Failed to insert weekly insight:", insertError);
        throw insertError;
    }

    if (!weeklyInsight) {
        throw new Error("Weekly insight was not created");
    }

    const patternsWithEmbeddings = await attachEmbeddingsToPatterns(patterns);

    const { data: insertedPatterns, error: patternsError } =
        await createWeeklyInsightPatterns(
            supabase,
            weeklyInsight.id,
            patternsWithEmbeddings.map((p) => ({
                title: p.title,
                patternType: p.pattern_type,
                description: p.description,
                evidence: p.evidence,
                question: p.question,
                suggestedExperiment: p.suggested_experiment,
                embedding: p.embedding,
            })),
        );

    if (patternsError) {
        console.error("Failed to insert patterns:", patternsError);
        throw patternsError;
    }

    return {
        data: {
            ...weeklyInsight,
            patterns: insertedPatterns ?? [],
        },
    };
};

export const getWeeklyInsightWithPatternsPaginated = async (
    supabase: SupabaseClient,
    cursor: string | null,
    limit: number,
): Promise<
    ServiceResult<{
        insights: WeeklyInsightWithPatterns[];
        nextCursor: string | null;
    }>
> => {
    const { data, nextCursor, error } =
        await findWeeklyInsightWithPatternsPaginated(supabase, cursor, limit);

    if (error) {
        console.error("Failed to fetch weekly insights:", error);
        return { error: "Failed to fetch weekly insights" };
    }

    return { data: { insights: data, nextCursor } };
};

export const getPatternById = async (
    supabase: SupabaseClient,
    patternId: string,
): Promise<ServiceResult<WeeklyInsightPattern>> => {
    const { data, error } = await findPatternById(supabase, patternId);

    if (error || !data) {
        return { error: "Pattern not found" };
    }

    return { data };
};

export const markPatternAsViewed = async (
    supabase: SupabaseClient,
    patternId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await updatePatternViewStatus(supabase, patternId);

    if (error) {
        console.error(`Failed to mark pattern ${patternId} as viewed:`, error);
        return { error: "Failed to update pattern" };
    }

    return { data: null };
};

export const getNewPatternsCount = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<number>> => {
    const { data: count, error } = await countNewPatterns(supabase);

    if (error) {
        console.error(`Failed to get new patterns count:`, error);
        return { error: "Failed to get new patterns count" };
    }
    return { data: count ?? 0 };
};

export const getWeeklyInsightWithPatternsByWeekStart = async (
    supabase: SupabaseClient,
    userId: string,
    weekStart: string,
): Promise<ServiceResult<WeeklyInsightWithPatterns | null>> => {
    const { data, error } = await findWeeklyInsightWithPatternsByWeekStart(
        supabase,
        userId,
        weekStart,
    );

    if (error?.code === "PGRST116") return { data: null };
    if (error) {
        console.error("Failed to fetch weekly insight:", error);
        return { error: "Failed to fetch weekly insight" };
    }

    return { data };
};

export const getTotalPatternsCount = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<number>> => {
    const { data, error } = await countPatterns(supabase);

    if (error) {
        console.error("Failed to get total patterns count:", error);
        return { error: "Failed to get total patterns count" };
    }

    return { data };
};
