import * as Sentry from "@sentry/nextjs";
import { generateUpdatedPersonaSummary } from "@/lib/ai/generate-persona-summary";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";
import { sendProgressCheckEmail } from "@/lib/email/service";
import { findPersona } from "@/lib/persona/repo";
import { savePersonaSummary } from "@/lib/persona/service";
import {
    createProgressInsight,
    shouldTriggerProgressInsight,
} from "@/lib/progress-insights/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ServiceResult } from "@/types";

const extractHeadline = (content: string): string => {
    try {
        const parsed = JSON.parse(content) as unknown;
        if (
            parsed !== null &&
            typeof parsed === "object" &&
            "headline" in parsed &&
            typeof (parsed as Record<string, unknown>).headline === "string"
        ) {
            return (parsed as Record<string, string>).headline;
        }
    } catch {
        const headlineMatch = content.match(/THE HEADLINE[:\s]*\n+([^\n]+)/i);
        if (headlineMatch?.[1]) {
            return headlineMatch[1].replace(/^[#*>\s]+/, "").trim();
        }
    }
    return "Your progress insight is ready";
};

export interface ProgressTriggerResult {
    triggered: boolean;
    progressInsightId?: string;
    reason: string;
}

export const checkAndTriggerProgress = async (
    userId: string,
): Promise<ServiceResult<ProgressTriggerResult>> => {
    try {
        const { data: triggerCheck, error: checkError } =
            await shouldTriggerProgressInsight(userId);

        if (checkError) {
            return { error: checkError };
        }

        if (!triggerCheck?.shouldTrigger) {
            return {
                data: {
                    triggered: false,
                    reason: `Not enough entries since last progress insight (need ${PROGRESS_TRIGGER_INTERVAL})`,
                },
            };
        }

        const supabase = createSupabaseAdmin();
        const { data: persona } = await findPersona(supabase, userId);
        const personaContext =
            buildPersonaContext(persona ?? null) || undefined;

        const { data: insight, error: generateError } =
            await createProgressInsight(userId, undefined, personaContext);

        if (generateError) {
            return {
                data: {
                    triggered: false,
                    reason: `Failed to generate: ${generateError}`,
                },
            };
        }

        if (insight?.content) {
            try {
                const { data: user } = await supabase
                    .from("users")
                    .select("email, username")
                    .eq("user_id", userId)
                    .single();

                if (user?.email) {
                    const [insightsResult, weeklyInsightsResult] =
                        await Promise.all([
                            supabase
                                .from("entry_insights")
                                .select("id", { count: "exact", head: true })
                                .eq("user_id", userId),
                            supabase
                                .from("weekly_insights")
                                .select("id")
                                .eq("user_id", userId),
                        ]);

                    const weeklyInsightIds =
                        weeklyInsightsResult.data?.map((item) => item.id) ?? [];

                    let patternsFound = 0;

                    if (weeklyInsightIds.length > 0) {
                        const patternsResult = await supabase
                            .from("weekly_insight_patterns")
                            .select("id", { count: "exact", head: true })
                            .in("weekly_insight_id", weeklyInsightIds);

                        patternsFound = patternsResult.count ?? 0;
                    }

                    const headline = extractHeadline(insight.content);
                    const nextMilestone =
                        triggerCheck.totalEntries + PROGRESS_TRIGGER_INTERVAL;
                    const progressLabel = `${triggerCheck.totalEntries}/${nextMilestone}`;
                    const fillPct = Math.min(
                        100,
                        (triggerCheck.totalEntries / nextMilestone) * 100,
                    );
                    const emailResult = await sendProgressCheckEmail(
                        user.email,
                        user.username,
                        headline,
                        {
                            entryCount: triggerCheck.totalEntries,
                            patternsFound,
                            insightsGiven: insightsResult.count ?? 0,
                            nextMilestone,
                            progressLabel,
                            fillPct,
                        },
                    );

                    if (!emailResult.success) {
                        console.error(
                            "Progress email failed:",
                            emailResult.error,
                        );
                    }
                }
            } catch (emailError) {
                console.error("Progress email error:", emailError);
            }

            if (persona?.summary) {
                // fire-and-forget: persona update must not block the trigger response
                void updatePersonaSummaryFromProgress(
                    supabase,
                    userId,
                    persona.displayName,
                    persona.summary,
                    insight.content,
                );
            }
        }

        return {
            data: {
                triggered: true,
                progressInsightId: insight?.id,
                reason: `Progress insight generated at ${triggerCheck.totalEntries} entries`,
            },
        };
    } catch (error) {
        Sentry.withScope((scope) => {
            scope.setTag("feature", "trigger.progress");
            scope.setFingerprint(["trigger-failure", "progress"]);
            scope.setContext("trigger", { userId });
            Sentry.captureException(error);
        });
        console.error("Progress trigger check failed:", error);
        return {
            data: {
                triggered: false,
                reason: "Internal error during progress check",
            },
        };
    }
};

const updatePersonaSummaryFromProgress = async (
    supabase: ReturnType<typeof createSupabaseAdmin>,
    userId: string,
    displayName: string,
    currentSummary: string,
    progressInsight: string,
): Promise<void> => {
    const newSummary = await generateUpdatedPersonaSummary({
        currentSummary,
        displayName,
        recentEntries: [],
        progressInsight,
    });
    if (!newSummary) return;
    const { error } = await savePersonaSummary(supabase, userId, newSummary);
    if (error) {
        console.error(
            "Failed to update persona summary after progress:",
            error,
        );
    }
};

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

    const entriesSinceLastProgress =
        data.totalEntries - data.entryCountAtLastProgress;

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
