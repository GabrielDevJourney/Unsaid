import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    InsertWeeklyInsightData,
    InsertWeeklyInsightPatternData,
} from "@/types";

/**
 * Insert a new weekly insight (without patterns).
 * Returns the created insight with its ID for pattern insertion.
 */
export const insertWeeklyInsight = async (
    supabase: SupabaseClient,
    data: InsertWeeklyInsightData,
) => {
    return supabase
        .from("weekly_insights")
        .insert({
            user_id: data.userId,
            week_start: data.weekStart,
            entry_ids: data.entryIds,
        })
        .select()
        .single();
};

/**
 * Insert a single pattern (insight card) for a weekly insight.
 */
export const insertWeeklyInsightPattern = async (
    supabase: SupabaseClient,
    data: InsertWeeklyInsightPatternData,
) => {
    return supabase
        .from("weekly_insight_patterns")
        .insert({
            weekly_insight_id: data.weeklyInsightId,
            title: data.title,
            pattern_type: data.patternType,
            description: data.description,
            evidence: data.evidence,
            question: data.question ?? null,
            suggested_experiment: data.suggestedExperiment ?? null,
        })
        .select()
        .single();
};

/**
 * Insert multiple patterns (insight cards) for a weekly insight.
 * More efficient than inserting one by one.
 */
export const insertWeeklyInsightPatterns = async (
    supabase: SupabaseClient,
    weeklyInsightId: string,
    patterns: Omit<InsertWeeklyInsightPatternData, "weeklyInsightId">[],
) => {
    const rows = patterns.map((pattern) => ({
        weekly_insight_id: weeklyInsightId,
        title: pattern.title,
        pattern_type: pattern.patternType,
        description: pattern.description,
        evidence: pattern.evidence,
        question: pattern.question ?? null,
        suggested_experiment: pattern.suggestedExperiment ?? null,
    }));

    return supabase.from("weekly_insight_patterns").insert(rows).select();
};

/**
 * Get weekly insight by week start date.
 * Returns null if no insight exists for that week.
 */
export const getWeeklyInsightByWeekStart = async (
    supabase: SupabaseClient,
    userId: string,
    weekStart: string,
) => {
    return supabase
        .from("weekly_insights")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .single();
};

/**
 * Get weekly insight with its patterns (insight cards).
 */
export const getWeeklyInsightWithPatterns = async (
    supabase: SupabaseClient,
    weeklyInsightId: string,
) => {
    const { data: insight, error: insightError } = await supabase
        .from("weekly_insights")
        .select("*")
        .eq("id", weeklyInsightId)
        .single();

    if (insightError || !insight) {
        return { data: null, error: insightError };
    }

    const { data: patterns, error: patternsError } = await supabase
        .from("weekly_insight_patterns")
        .select("*")
        .eq("weekly_insight_id", weeklyInsightId)
        .order("created_at", { ascending: true });

    if (patternsError) {
        return { data: null, error: patternsError };
    }

    return {
        data: { ...insight, patterns: patterns ?? [] },
        error: null,
    };
};

/**
 * Get all weekly insights for a user (paginated).
 */
export const getWeeklyInsightsPaginated = async (
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    pageSize = 10,
) => {
    const offset = (page - 1) * pageSize;

    return supabase
        .from("weekly_insights")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("week_start", { ascending: false })
        .range(offset, offset + pageSize - 1);
};

/**
 * Get patterns by type for a user (for filtering/analytics).
 */
export const getPatternsByType = async (
    supabase: SupabaseClient,
    userId: string,
    patternType: string,
) => {
    return supabase
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
};
