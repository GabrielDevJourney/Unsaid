import type {
    WeeklyInsight,
    WeeklyInsightPattern,
    WeeklyInsightPatternRowEncrypted,
    WeeklyInsightRowData,
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

/**
 * Transform encrypted weekly insight pattern DB row to domain WeeklyInsightPattern.
 */
export const toWeeklyInsightPattern = (
    patternRow: WeeklyInsightPatternRowEncrypted,
): WeeklyInsightPattern => {
    const description = decrypt({
        encryptedContent: patternRow.encrypted_description ?? "",
        iv: patternRow.description_iv ?? "",
        tag: patternRow.description_tag ?? "",
    });

    // Question and suggested_experiment are optional
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
    };
};
