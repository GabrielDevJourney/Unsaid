import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    InsertWeeklyInsightData,
    InsertWeeklyInsightPatternData,
    WeeklyInsight,
    WeeklyInsightPattern,
    WeeklyInsightWithPatterns,
} from "@/types";
import { encrypt } from "../crypto";
import { toWeeklyInsight, toWeeklyInsightPattern } from "./transformers";

/**
 * Insert a new weekly insight (without patterns).
 * Returns the created insight with its ID for pattern insertion.
 */
export const insertWeeklyInsight = async (
    supabase: SupabaseClient,
    data: InsertWeeklyInsightData,
): Promise<{ data: WeeklyInsight | null; error: Error | null }> => {
    const { data: insightRow, error } = await supabase
        .from("weekly_insights")
        .insert({
            user_id: data.userId,
            week_start: data.weekStart,
            entry_ids: data.entryIds,
        })
        .select("id, user_id, week_start, entry_ids, created_at, updated_at")
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toWeeklyInsight(insightRow), error: null };
};

/**
 * Insert a single pattern (insight card) for a weekly insight.
 * Encrypts description, question, and suggested_experiment.
 */
export const insertWeeklyInsightPattern = async (
    supabase: SupabaseClient,
    data: InsertWeeklyInsightPatternData,
): Promise<{ data: WeeklyInsightPattern | null; error: Error | null }> => {
    const descriptionEncrypted = encrypt(data.description);

    const questionEncrypted = data.question ? encrypt(data.question) : null;
    const experimentEncrypted = data.suggestedExperiment
        ? encrypt(data.suggestedExperiment)
        : null;

    const { data: patternRow, error } = await supabase
        .from("weekly_insight_patterns")
        .insert({
            weekly_insight_id: data.weeklyInsightId,
            title: data.title,
            pattern_type: data.patternType,
            encrypted_description: descriptionEncrypted.encryptedContent,
            description_iv: descriptionEncrypted.iv,
            description_tag: descriptionEncrypted.tag,
            evidence: data.evidence,
            encrypted_question: questionEncrypted?.encryptedContent ?? null,
            question_iv: questionEncrypted?.iv ?? null,
            question_tag: questionEncrypted?.tag ?? null,
            encrypted_suggested_experiment:
                experimentEncrypted?.encryptedContent ?? null,
            suggested_experiment_iv: experimentEncrypted?.iv ?? null,
            suggested_experiment_tag: experimentEncrypted?.tag ?? null,
        })
        .select()
        .single();

    if (error || !patternRow) {
        return { data: null, error };
    }

    return { data: toWeeklyInsightPattern(patternRow), error: null };
};

/**
 * Insert multiple patterns (insight cards) for a weekly insight.
 * More efficient than inserting one by one.
 * Encrypts description, question, and suggested_experiment for each.
 */
export const insertWeeklyInsightPatterns = async (
    supabase: SupabaseClient,
    weeklyInsightId: string,
    patterns: Omit<InsertWeeklyInsightPatternData, "weeklyInsightId">[],
): Promise<{ data: WeeklyInsightPattern[]; error: Error | null }> => {
    const patternInserts = patterns.map((pattern) => {
        const descriptionEncrypted = encrypt(pattern.description);
        const questionEncrypted = pattern.question
            ? encrypt(pattern.question)
            : null;
        const experimentEncrypted = pattern.suggestedExperiment
            ? encrypt(pattern.suggestedExperiment)
            : null;

        return {
            weekly_insight_id: weeklyInsightId,
            title: pattern.title,
            pattern_type: pattern.patternType,
            encrypted_description: descriptionEncrypted.encryptedContent,
            description_iv: descriptionEncrypted.iv,
            description_tag: descriptionEncrypted.tag,
            evidence: pattern.evidence,
            encrypted_question: questionEncrypted?.encryptedContent ?? null,
            question_iv: questionEncrypted?.iv ?? null,
            question_tag: questionEncrypted?.tag ?? null,
            encrypted_suggested_experiment:
                experimentEncrypted?.encryptedContent ?? null,
            suggested_experiment_iv: experimentEncrypted?.iv ?? null,
            suggested_experiment_tag: experimentEncrypted?.tag ?? null,
        };
    });

    const { data: patternRows, error } = await supabase
        .from("weekly_insight_patterns")
        .insert(patternInserts)
        .select();

    if (error || !patternRows) {
        return { data: [], error };
    }

    return { data: patternRows.map(toWeeklyInsightPattern), error: null };
};

/**
 * Get weekly insight by week start date.
 * Returns null if no insight exists for that week.
 */
export const getWeeklyInsightByWeekStart = async (
    supabase: SupabaseClient,
    userId: string,
    weekStart: string,
): Promise<{ data: WeeklyInsight | null; error: Error | null }> => {
    const { data: insightRow, error } = await supabase
        .from("weekly_insights")
        .select("id, user_id, week_start, entry_ids, created_at, updated_at")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toWeeklyInsight(insightRow), error: null };
};

/**
 * Get weekly insight with patterns by week start date.
 * Combines the insight and its patterns in a single return.
 * Decrypts pattern content.
 */
export const getWeeklyInsightWithPatternsByWeekStart = async (
    supabase: SupabaseClient,
    userId: string,
    weekStart: string,
): Promise<{ data: WeeklyInsightWithPatterns | null; error: Error | null }> => {
    const { data: insightRow, error: insightError } = await supabase
        .from("weekly_insights")
        .select("id, user_id, week_start, entry_ids, created_at, updated_at")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .single();

    if (insightError || !insightRow) {
        return { data: null, error: insightError };
    }

    const { data: patternRows, error: patternsError } = await supabase
        .from("weekly_insight_patterns")
        .select("*")
        .eq("weekly_insight_id", insightRow.id)
        .order("created_at", { ascending: true });

    if (patternsError) {
        return { data: null, error: patternsError };
    }

    const insight = toWeeklyInsight(insightRow);
    const patterns = (patternRows ?? []).map(toWeeklyInsightPattern);

    return {
        data: { ...insight, patterns },
        error: null,
    };
};

/**
 * Get weekly insight with its patterns (insight cards).
 * Decrypts pattern content.
 */
export const getWeeklyInsightWithPatterns = async (
    supabase: SupabaseClient,
    weeklyInsightId: string,
): Promise<{ data: WeeklyInsightWithPatterns | null; error: Error | null }> => {
    const { data: insightRow, error: insightError } = await supabase
        .from("weekly_insights")
        .select("id, user_id, week_start, entry_ids, created_at, updated_at")
        .eq("id", weeklyInsightId)
        .single();

    if (insightError || !insightRow) {
        return { data: null, error: insightError };
    }

    const { data: patternRows, error: patternsError } = await supabase
        .from("weekly_insight_patterns")
        .select("*")
        .eq("weekly_insight_id", weeklyInsightId)
        .order("created_at", { ascending: true });

    if (patternsError) {
        return { data: null, error: patternsError };
    }

    const insight = toWeeklyInsight(insightRow);
    const patterns = (patternRows ?? []).map(toWeeklyInsightPattern);

    return {
        data: { ...insight, patterns },
        error: null,
    };
};

/**
 * Get all weekly insights for a user (paginated).
 * Does not include patterns - use getWeeklyInsightWithPatterns for that.
 */
export const getWeeklyInsightsPaginated = async (
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    pageSize = 10,
): Promise<{ data: WeeklyInsight[]; error: Error | null; count: number }> => {
    const offset = (page - 1) * pageSize;

    const {
        data: insightRows,
        error,
        count,
    } = await supabase
        .from("weekly_insights")
        .select("id, user_id, week_start, entry_ids, created_at, updated_at", {
            count: "exact",
        })
        .eq("user_id", userId)
        .order("week_start", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error || !insightRows) {
        return { data: [], error, count: 0 };
    }

    return {
        data: insightRows.map(toWeeklyInsight),
        error: null,
        count: count ?? 0,
    };
};

/**
 * Get patterns by type for a user (for filtering/analytics).
 * Decrypts pattern content.
 */
export const getPatternsByType = async (
    supabase: SupabaseClient,
    userId: string,
    patternType: string,
): Promise<{ data: WeeklyInsightPattern[]; error: Error | null }> => {
    const { data: patternRows, error } = await supabase
        .from("weekly_insight_patterns")
        .select(
            `
            *,
            weekly_insights!inner(user_id)
        `,
        )
        .eq("weekly_insights.user_id", userId)
        .eq("pattern_type", patternType)
        .order("created_at", { ascending: false });

    if (error || !patternRows) {
        return { data: [], error };
    }

    return { data: patternRows.map(toWeeklyInsightPattern), error: null };
};
