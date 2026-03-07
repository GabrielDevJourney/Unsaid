import type {
    SearchWeeklyInsightPatternRowResult,
    WeeklyInsight,
    WeeklyInsightPattern,
    WeeklyInsightPatternRowEncrypted,
    WeeklyInsightPatternRowResolved,
    WeeklyInsightPatternWithSimilarity,
    WeeklyInsightRowData,
    WeeklyInsightWithPatternEncrypted,
    WeeklyInsightWithPatternRPCRow,
    WeeklyInsightWithPatterns,
} from "@/types";
import { decrypt } from "../crypto";

/**
 * Transform weekly insight DB row to domain WeeklyInsight.
 * No encryption on this table - just camelCase conversion.
 */
export const toWeeklyInsight = (
    insightRow: WeeklyInsightRowData,
): WeeklyInsight => ({
    id: insightRow.id,
    userId: insightRow.user_id,
    weekStart: insightRow.week_start,
    entryIds: insightRow.entry_ids,
    createdAt: insightRow.created_at,
    updatedAt: insightRow.updated_at,
});

export const toWeeklyInsightWithPatterns = (
    weeklyInsightWithPatterns: WeeklyInsightWithPatternEncrypted,
): WeeklyInsightWithPatterns => {
    return {
        ...toWeeklyInsight(weeklyInsightWithPatterns),
        patterns: weeklyInsightWithPatterns.weekly_insight_patterns.map(
            toWeeklyInsightPattern,
        ),
    };
};

/**
 * Transform encrypted weekly insight pattern DB row to domain WeeklyInsightPattern.
 * This is used when fetching patterns separately from the main RPC, evidence UUIDs are used as label fallbacks since date resolution requires the RPC join.
 */
export const toWeeklyInsightPattern = (
    patternRow: WeeklyInsightPatternRowEncrypted,
): WeeklyInsightPattern => {
    const description = decrypt({
        encryptedContent: patternRow.encrypted_description ?? "",
        iv: patternRow.description_iv ?? "",
        tag: patternRow.description_tag ?? "",
    });

    const question =
        patternRow.encrypted_question &&
        patternRow.question_iv &&
        patternRow.question_tag
            ? decrypt({
                  encryptedContent: patternRow.encrypted_question,
                  iv: patternRow.question_iv,
                  tag: patternRow.question_tag,
              })
            : null;

    const suggestedExperiment =
        patternRow.encrypted_suggested_experiment &&
        patternRow.suggested_experiment_iv &&
        patternRow.suggested_experiment_tag
            ? decrypt({
                  encryptedContent: patternRow.encrypted_suggested_experiment,
                  iv: patternRow.suggested_experiment_iv,
                  tag: patternRow.suggested_experiment_tag,
              })
            : null;

    return {
        id: patternRow.id,
        weeklyInsightId: patternRow.weekly_insight_id,
        title: patternRow.title,
        patternType:
            patternRow.pattern_type as WeeklyInsightPattern["patternType"],
        description,
        evidence: patternRow.evidence.map((entryId) => ({
            entryId,
            label: entryId,
        })),
        question,
        suggestedExperiment,
        createdAt: patternRow.created_at,
        isViewed: patternRow.is_viewed,
    };
};

/**
 * Transform a resolved pattern row (from the RPC) to domain WeeklyInsightPattern.
 * Evidence is already { entryId, label }
 */
export const toWeeklyInsightPatternResolved = (
    patternRow: WeeklyInsightPatternRowResolved,
): WeeklyInsightPattern => {
    const description = decrypt({
        encryptedContent: patternRow.encrypted_description ?? "",
        iv: patternRow.description_iv ?? "",
        tag: patternRow.description_tag ?? "",
    });

    const question =
        patternRow.encrypted_question &&
        patternRow.question_iv &&
        patternRow.question_tag
            ? decrypt({
                  encryptedContent: patternRow.encrypted_question,
                  iv: patternRow.question_iv,
                  tag: patternRow.question_tag,
              })
            : null;

    const suggestedExperiment =
        patternRow.encrypted_suggested_experiment &&
        patternRow.suggested_experiment_iv &&
        patternRow.suggested_experiment_tag
            ? decrypt({
                  encryptedContent: patternRow.encrypted_suggested_experiment,
                  iv: patternRow.suggested_experiment_iv,
                  tag: patternRow.suggested_experiment_tag,
              })
            : null;

    return {
        id: patternRow.id,
        weeklyInsightId: patternRow.weekly_insight_id,
        title: patternRow.title,
        patternType:
            patternRow.pattern_type as WeeklyInsightPattern["patternType"],
        description,
        evidence: patternRow.evidence,
        question,
        suggestedExperiment,
        createdAt: patternRow.created_at,
        isViewed: patternRow.is_viewed,
    };
};

/**
 * Transform an RPC row to domain WeeklyInsightWithPatterns.
 * Uses toWeeklyInsightPatternResolved so evidence labels are already dates.
 */
export const toWeeklyInsightWithPatternsFromRPC = (
    row: WeeklyInsightWithPatternRPCRow,
): WeeklyInsightWithPatterns => ({
    id: row.id,
    userId: row.user_id,
    weekStart: row.week_start,
    entryIds: row.entry_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    patterns: row.patterns.map(toWeeklyInsightPatternResolved),
});

export const toWeeklyInsightPatternWithSimilarity = (
    patternRow: SearchWeeklyInsightPatternRowResult,
): WeeklyInsightPatternWithSimilarity => {
    const basePattern = toWeeklyInsightPatternResolved(patternRow);
    return {
        ...basePattern,
        similarity: patternRow.similarity,
        weekStart: patternRow.week_start,
    };
};
