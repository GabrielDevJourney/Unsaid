import { generateWeeklyInsight } from "@/lib/ai/generate-weekly-insight";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreateWeeklyInsightPayload } from "@/types/domain/insights";
import {
    getWeeklyInsightByWeekStart,
    insertWeeklyInsight,
    insertWeeklyInsightPatterns,
} from "./repo";

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
 */
export const createWeeklyInsight = async (
    userId: string,
    payload: CreateWeeklyInsightPayload,
) => {
    const supabase = createSupabaseAdmin();

    // Check if insight already exists for this week
    const { data: existing } = await getWeeklyInsightByWeekStart(
        supabase,
        userId,
        payload.weekStart,
    );

    if (existing) {
        return {
            error: "Weekly insight already exists for this week",
            data: null,
        };
    }

    // Need at least 2 entries to find patterns
    if (payload.entries.length < 2) {
        return {
            error: "Not enough entries for weekly insight (minimum 2)",
            data: null,
        };
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
        return {
            error: "Failed to generate patterns",
            data: null,
        };
    }

    // Insert weekly insight record
    const { data: weeklyInsight, error: insertError } =
        await insertWeeklyInsight(supabase, {
            userId,
            weekStart: payload.weekStart,
            entryIds: payload.entryIds,
        });

    if (insertError || !weeklyInsight) {
        console.error("Failed to insert weekly insight:", insertError);
        return {
            error: "Failed to save weekly insight",
            data: null,
        };
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
        console.error("Failed to insert patterns:", patternsError);
        // Weekly insight was created but patterns failed
        // This is a partial failure - log but return the insight
    }

    return {
        data: {
            ...weeklyInsight,
            patterns: insertedPatterns ?? [],
        },
        error: null,
    };
};

/**
 * Get the Monday of the week for a given date.
 * Used to determine week boundaries.
 */
export const getWeekStart = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Get the date range for a week (Monday to Sunday).
 */
export const getWeekRange = (weekStart: string): { start: Date; end: Date } => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
