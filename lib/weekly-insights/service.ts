import { generateWeeklyInsight } from "@/lib/ai/generate-weekly-insight";
import { MIN_ENTRIES_FOR_WEEKLY_INSIGHT } from "@/lib/constants";
import { getWeekRange, getWeekStart } from "@/lib/date-utils";
import { sendWeeklyPatternsEmail } from "@/lib/email/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type {
    CreateWeeklyInsightPayload,
    ServiceResult,
    WeeklyInsightWithPatterns,
} from "@/types";
import {
    getWeeklyInsightByWeekStart,
    insertWeeklyInsight,
    insertWeeklyInsightPatterns,
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
    content: string;
    created_at: string;
}

/**
 * Process weekly insights for all users with entries in the given week.
 * Used by cron job.
 *
 * Flow:
 * 1. Get last week's date range
 * 2. Fetch all entries for that range
 * 3. Group entries by user
 * 4. Generate insight for each user (skip if < 2 entries)
 * 5. Send email notification
 */
export const processWeeklyInsightsForAllUsers = async (): Promise<
    ServiceResult<WeeklyInsightsBatchResult>
> => {
    const supabase = createSupabaseAdmin();

    // Get last week's date range (Monday to Sunday of previous week)
    const today = new Date();
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const weekStart = getWeekStart(lastWeekDate);
    const { start, end } = getWeekRange(weekStart);

    // Fetch all entries from last week
    const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select("id, user_id, content, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

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

    // Group entries by user
    const entriesByUser = groupEntriesByUser(entries);

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

    // Process each user
    for (const [userId, userEntries] of Object.entries(entriesByUser)) {
        results.processed++;

        // Skip if not enough entries
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

    return { data: results };
};

/**
 * Group entries by user_id.
 */
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

/**
 * Process weekly insight for a single user and send email.
 */
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
        const result = await createWeeklyInsight(userId, {
            weekStart,
            entryIds: entries.map((e) => e.id),
            entries: entries.map((e) => ({
                id: e.id,
                content: e.content,
                createdAt: e.created_at,
            })),
        });

        if ("error" in result && result.error) {
            return { success: false, error: result.error };
        }

        // Send email notification
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

/**
 * Send weekly insight email to user.
 */
const sendWeeklyInsightEmail = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    patterns: Array<{ title: string }>,
): Promise<{ sent: boolean; error?: string }> => {
    if (patterns.length === 0) {
        return { sent: false };
    }

    try {
        const { data: user } = await supabase
            .from("users")
            .select("email")
            .eq("user_id", userId)
            .single();

        if (!user?.email) {
            return { sent: false, error: "User email not found" };
        }

        const patternPreviews = patterns.slice(0, 3).map((p) => p.title);
        const emailResult = await sendWeeklyPatternsEmail(
            user.email,
            user.email.split("@")[0],
            patterns.length,
            patternPreviews,
        );

        return {
            sent: emailResult.success,
            error: emailResult.error,
        };
    } catch (error) {
        console.error(`Email failed for ${userId}:`, error);
        return { sent: false, error: "Email send failed" };
    }
};

/**
 * Generate and save weekly insight with patterns (insight cards).
 *
 * Flow:
 * 1. Check if insight already exists for this week
 * 2. Generate patterns using AI
 * 3. Save weekly insight record
 * 4. Save pattern cards
 *
 * Uses admin client (bypasses RLS - insights are system-created).
 *
 * Returns error for expected failures (duplicate, not enough entries).
 * Throws for unexpected DB errors.
 */
export const createWeeklyInsight = async (
    userId: string,
    payload: CreateWeeklyInsightPayload,
): Promise<ServiceResult<WeeklyInsightWithPatterns>> => {
    const supabase = createSupabaseAdmin();

    // Check if insight already exists for this week
    const { data: existing } = await getWeeklyInsightByWeekStart(
        supabase,
        userId,
        payload.weekStart,
    );

    if (existing) {
        return { error: "Weekly insight already exists for this week" };
    }

    // Need at least 2 entries to find patterns
    if (payload.entries.length < 2) {
        return { error: "Not enough entries for weekly insight (minimum 2)" };
    }

    // Generate patterns using AI
    const patterns = await generateWeeklyInsight(
        payload.entries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        })),
    );

    if (patterns.length === 0) {
        return { error: "AI failed to identify patterns" };
    }

    // Insert weekly insight record
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

    // Insert pattern cards
    const { data: insertedPatterns, error: patternsError } =
        await insertWeeklyInsightPatterns(
            supabase,
            weeklyInsight.id,
            patterns.map((p) => ({
                title: p.title,
                patternType: p.pattern_type,
                description: p.description,
                evidence: p.evidence,
                question: p.question,
                suggestedExperiment: p.suggested_experiment,
            })),
        );

    if (patternsError) {
        // Weekly insight created but patterns failed - log but return insight
        console.error("Failed to insert patterns:", patternsError);
    }

    return {
        data: {
            ...weeklyInsight,
            patterns: insertedPatterns ?? [],
        },
    };
};
