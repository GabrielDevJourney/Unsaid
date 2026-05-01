import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type {
    InsertWeeklyInsightData,
    InsertWeeklyInsightPatternData,
    SearchWeeklyInsightPatternRowResult,
    WeeklyInsight,
    WeeklyInsightPattern,
    WeeklyInsightPatternRowResolved,
    WeeklyInsightPatternWithSimilarity,
    WeeklyInsightWithPatternRPCRow,
    WeeklyInsightWithPatterns,
} from "@/types";
import { encrypt } from "../crypto";
import { formatDate } from "../date-utils";
import {
    toWeeklyInsight,
    toWeeklyInsightPattern,
    toWeeklyInsightPatternResolved,
    toWeeklyInsightPatternWithSimilarity,
    toWeeklyInsightWithPatternsFromRPC,
} from "./transformers";

/**
 * Insert a new weekly insight (without patterns).
 * Returns the created insight with its ID for pattern insertion.
 */
export const insertWeeklyInsight = async (
    supabase: SupabaseClient,
    data: InsertWeeklyInsightData,
): Promise<{ data: WeeklyInsight | null; error: PostgrestError | null }> => {
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
 * Insert multiple patterns (insight cards) for a weekly insight.
 * Accepts decrypted pattern data, encrypts it, and inserts into the DB.
 * Returns the created patterns with their IDs.
 * Encrypts description, question, and suggested_experiment for each.
 * The return shape can be used in emails or other places where we want to show the decrypted content immediately.
 */
export const createWeeklyInsightPatterns = async (
    supabase: SupabaseClient,
    weeklyInsightId: string,
    patterns: Omit<InsertWeeklyInsightPatternData, "weeklyInsightId">[],
): Promise<{ data: WeeklyInsightPattern[]; error: PostgrestError | null }> => {
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
            embedding: pattern.embedding ?? null,
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

export const findWeeklyInsightWithPatternsByWeekStart = async (
    supabase: SupabaseClient,
    userId: string,
    weekStart: string,
): Promise<{
    data: WeeklyInsightWithPatterns | null;
    error: PostgrestError | null;
}> => {
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
 * Get paginated weekly insights with patterns.
 * Uses the get_weekly_insights_with_evidence RPC so evidence UUIDs are
 * resolved to { entryId, label } (entry created_at date) in a single query —
 * no second round trip needed in the service layer.
 */
export const findWeeklyInsightWithPatternsPaginated = async (
    supabase: SupabaseClient,
    cursor: string | null,
    limit: number,
): Promise<{
    data: WeeklyInsightWithPatterns[];
    nextCursor: string | null;
    error: PostgrestError | null;
}> => {
    const { data: rows, error } = await supabase.rpc(
        "get_weekly_insights_with_evidence",
        {
            p_cursor: cursor ?? null,
            p_limit: limit,
        },
    );

    if (error || !rows) {
        return { data: [], nextCursor: null, error };
    }

    const typedRows = rows as WeeklyInsightWithPatternRPCRow[];
    const mapped = typedRows.map(toWeeklyInsightWithPatternsFromRPC);
    const nextCursor =
        typedRows.length === limit
            ? typedRows[typedRows.length - 1].week_start
            : null;

    return { data: mapped, nextCursor, error: null };
};

/**
 * Get a single pattern by ID with resolved evidence labels.
 * RLS ensures the pattern belongs to the authenticated user.
 * Evidence UUIDs are resolved to { entryId, label } via a second query.
 */
export const findPatternById = async (
    supabase: SupabaseClient,
    patternId: string,
): Promise<{
    data: WeeklyInsightPattern | null;
    error: PostgrestError | null;
}> => {
    const { data: patternRow, error } = await supabase
        .from("weekly_insight_patterns")
        .select("*")
        .eq("id", patternId)
        .single();

    if (error || !patternRow) {
        return { data: null, error };
    }

    const { data: entries } = await supabase
        .from("entries")
        .select("id, created_at")
        .in("id", patternRow.evidence);

    const dateMap = new Map(
        (entries ?? []).map((e) => [
            e.id,
            formatDate(new Date(e.created_at), {
                month: "long",
                day: "2-digit",
            }).toLocaleLowerCase(),
        ]),
    );

    const resolved: WeeklyInsightPatternRowResolved = {
        ...patternRow,
        evidence: patternRow.evidence.map((entryId: string) => ({
            entryId,
            label: dateMap.get(entryId) ?? entryId,
        })),
    };

    return { data: toWeeklyInsightPatternResolved(resolved), error: null };
};

export const updatePatternViewStatus = async (
    supabase: SupabaseClient,
    patternId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase
        .from("weekly_insight_patterns")
        .update({ is_viewed: true })
        .eq("id", patternId);

    return { data: null, error };
};

export const countNewPatterns = async (
    supabase: SupabaseClient,
): Promise<{ data: number; error: PostgrestError | null }> => {
    const { count, error } = await supabase
        .from("weekly_insight_patterns")
        .select("id", { count: "exact", head: true })
        .eq("is_viewed", false);

    return { data: count ?? 0, error };
};

export const countPatterns = async (
    supabase: SupabaseClient,
): Promise<{ data: number; error: PostgrestError | null }> => {
    const { count, error } = await supabase
        .from("weekly_insight_patterns")
        .select("id", { count: "exact", head: true });

    return { data: count ?? 0, error };
};

export const findWeeklyInsightsPaginated = async (
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    pageSize = 10,
): Promise<{
    data: WeeklyInsight[];
    error: PostgrestError | null;
    count: number;
}> => {
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

export const countWeeklyInsights = async (
    supabase: SupabaseClient,
): Promise<{ data: number; error: PostgrestError | null }> => {
    const { count, error } = await supabase
        .from("weekly_insights")
        .select("id", { count: "exact", head: true });

    return { data: count ?? 0, error };
};

/**
 * Count total patterns across all weekly insights for a specific user.
 * Used with admin client in cron trial-reminder and weekly-insights email contexts.
 */
export const countPatternsForUser = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ count: number; error: PostgrestError | null }> => {
    const { data: insights, error: insightsError } = await supabase
        .from("weekly_insights")
        .select("id")
        .eq("user_id", userId);
    if (insightsError) return { count: 0, error: insightsError };
    const ids = (insights ?? []).map((i) => i.id);
    if (ids.length === 0) return { count: 0, error: null };
    const { count, error } = await supabase
        .from("weekly_insight_patterns")
        .select("id", { count: "exact", head: true })
        .in("weekly_insight_id", ids);
    return { count: count ?? 0, error };
};

export const findPatternsByType = async (
    supabase: SupabaseClient,
    userId: string,
    patternType: string,
): Promise<{ data: WeeklyInsightPattern[]; error: PostgrestError | null }> => {
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

/**
 * Get weekly insight patterns created within a date range for a user.
 * Used to enrich progress insight generation with recent pattern context.
 * Admin client bypasses RLS — filters by user_id explicitly.
 */
export const findWeeklyPatternsForDateRange = async (
    supabase: SupabaseClient,
    userId: string,
    fromDate: string,
    toDate: string,
    limit = 3,
): Promise<{ data: WeeklyInsightPattern[]; error: PostgrestError | null }> => {
    const { data: weeklyRows, error: weeklyError } = await supabase
        .from("weekly_insights")
        .select("id")
        .eq("user_id", userId)
        .gte("week_start", fromDate.slice(0, 10))
        .lte("week_start", toDate.slice(0, 10));

    if (weeklyError || !weeklyRows || weeklyRows.length === 0) {
        return { data: [], error: weeklyError };
    }

    const weeklyIds = weeklyRows.map((r) => r.id);

    const { data: patternRows, error: patternsError } = await supabase
        .from("weekly_insight_patterns")
        .select("*")
        .in("weekly_insight_id", weeklyIds)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (patternsError || !patternRows) {
        return { data: [], error: patternsError };
    }

    return { data: patternRows.map(toWeeklyInsightPattern), error: null };
};

/**
 * Search weekly insights by embedding vector using semantic similarity.
 * Calls the search_weekly_insight_patterns_by_embedding RPC function.
 * Decrypts content for each result.
 */
export const findWeeklyInsightPatternsByEmbedding = async (
    supabase: SupabaseClient,
    userId: string,
    queryEmbedding: string,
    limit = 10,
    threshold = 0.5,
): Promise<{
    data: WeeklyInsightPatternWithSimilarity[];
    error: PostgrestError | null;
}> => {
    const { data: searchRows, error } = await supabase.rpc(
        "search_weekly_insight_patterns_by_embedding",
        {
            query_embedding: queryEmbedding,
            user_id_param: userId,
            match_threshold: threshold,
            match_count: limit,
        },
    );

    if (error || !searchRows) {
        return { data: [], error };
    }

    return {
        data: (searchRows as SearchWeeklyInsightPatternRowResult[]).map(
            toWeeklyInsightPatternWithSimilarity,
        ),
        error: null,
    };
};
