import {
    createProgressInsight,
    PROGRESS_TRIGGER_INTERVAL,
    shouldTriggerProgressInsight,
} from "@/lib/progress-insights/service";
import type { ServiceResult } from "@/types";

/**
 * Result of checking the progress trigger.
 */
export interface ProgressTriggerResult {
    triggered: boolean;
    progressInsightId?: string;
    reason: string;
}

/**
 * Check if a progress insight should be generated and create one if needed.
 *
 * Called after entry creation to check if the user has hit a milestone.
 * Runs asynchronously - errors are logged but don't block entry creation.
 *
 * @param userId - The user's ID
 * @returns Result indicating whether insight was generated
 */
export const checkAndTriggerProgress = async (
    userId: string,
): Promise<ServiceResult<ProgressTriggerResult>> => {
    try {
        // Check if we should trigger
        const { data: triggerCheck, error: checkError } =
            await shouldTriggerProgressInsight(userId);

        if (checkError) {
            return {
                error: checkError,
            };
        }

        if (!triggerCheck?.shouldTrigger) {
            return {
                data: {
                    triggered: false,
                    reason: `Not enough entries since last progress insight (need ${PROGRESS_TRIGGER_INTERVAL})`,
                },
            };
        }

        // Generate the progress insight
        const { data: insight, error: generateError } =
            await createProgressInsight(userId);

        if (generateError) {
            return {
                data: {
                    triggered: false,
                    reason: `Failed to generate: ${generateError}`,
                },
            };
        }

        return {
            data: {
                triggered: true,
                progressInsightId: insight?.id,
                reason: `Progress insight generated at ${triggerCheck.totalEntries} entries`,
            },
        };
    } catch (error) {
        // Log but don't throw - progress insights shouldn't block entry creation
        console.error("Progress trigger check failed:", error);
        return {
            data: {
                triggered: false,
                reason: "Internal error during progress check",
            },
        };
    }
};

/**
 * Check progress trigger without generating.
 * Useful for UI to show "15 entries until next insight".
 */
export const getProgressStatus = async (
    userId: string,
): Promise<
    ServiceResult<{
        totalEntries: number;
        entriesSinceLastProgress: number;
        entriesUntilNext: number;
        shouldTrigger: boolean;
    }>
> => {
    const { data, error } = await shouldTriggerProgressInsight(userId);

    if (error) {
        return { error };
    }

    if (!data) {
        return {
            data: {
                totalEntries: 0,
                entriesSinceLastProgress: 0,
                entriesUntilNext: PROGRESS_TRIGGER_INTERVAL,
                shouldTrigger: false,
            },
        };
    }

    // We need to fetch user_progress to get entry_count_at_last_progress
    // Since shouldTriggerProgressInsight already does this, we can refactor later
    // For now, estimate based on total and whether trigger would fire
    const entriesSinceLastProgress = data.shouldTrigger
        ? PROGRESS_TRIGGER_INTERVAL
        : data.totalEntries % PROGRESS_TRIGGER_INTERVAL;

    const entriesUntilNext = data.shouldTrigger
        ? 0
        : PROGRESS_TRIGGER_INTERVAL - entriesSinceLastProgress;

    return {
        data: {
            totalEntries: data.totalEntries,
            entriesSinceLastProgress,
            entriesUntilNext,
            shouldTrigger: data.shouldTrigger,
        },
    };
};
