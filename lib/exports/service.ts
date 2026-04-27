import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DATE_DISPLAY_LONG, formatDate } from "@/lib/date-utils";
import { getEntriesWithInsightsPaginated } from "@/lib/entries/repo";
import { findProgressInsightsPaginated } from "@/lib/progress-insights/repo";
import { findWeeklyInsightWithPatternsPaginated } from "@/lib/weekly-insights/repo";
import type { EntryWithInsight } from "@/types/domain/entries";
import type {
    ProgressInsight,
    WeeklyInsightWithPatterns,
} from "@/types/domain/insights";

const ENTRY_BATCH_SIZE = 100;
const WEEKLY_BATCH_SIZE = 25;
const PROGRESS_BATCH_SIZE = 50;

const captureExportError = (
    err: unknown,
    context: {
        userId: string;
        domain: "entries" | "weekly" | "progress";
        errorType: "query_error" | "transformer_error";
        page?: number;
        cursor?: string | null;
        batchSize: number;
    },
) => {
    Sentry.withScope((scope) => {
        scope.setTag("feature", "export");
        scope.setTag("export.domain", context.domain);
        scope.setTag("export.error_type", context.errorType);
        scope.setFingerprint(["export-failure", context.domain]);
        scope.setContext("export", {
            userId: context.userId,
            domain: context.domain,
            page: context.page ?? null,
            cursor: context.cursor ?? null,
            batchSize: context.batchSize,
        });

        if (err instanceof Error) {
            Sentry.captureException(err);
        } else {
            Sentry.captureMessage(`export: ${context.domain} batch failed`, {
                level: "error",
            });
        }
    });
};

export const formatEntry = (entry: EntryWithInsight): string => {
    const lines: string[] = [];

    lines.push(
        `## ${formatDate(entry.createdAt, { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}`,
    );
    lines.push("");
    lines.push(entry.content);
    lines.push("");

    if (entry.entryInsight) {
        lines.push("**Unsaid's insight**");
        lines.push(entry.entryInsight.content);
        lines.push("");
        if (entry.entryInsight.tags.length > 0) {
            lines.push(`*Themes: ${entry.entryInsight.tags.join(", ")}*`);
            lines.push("");
        }
    } else {
        lines.push("*(No insight generated for this entry.)*");
        lines.push("");
    }

    lines.push("---");
    lines.push("");

    return lines.join("\n");
};

export const formatWeeklyInsight = (
    weekly: WeeklyInsightWithPatterns,
): string => {
    if (weekly.patterns.length === 0) return "";

    const lines: string[] = [];
    lines.push(
        `## Week of ${formatDate(weekly.weekStart, { month: "long", day: "numeric", timeZone: "UTC" })}`,
    );
    lines.push("");

    for (const pattern of weekly.patterns) {
        lines.push(`### ${pattern.title}`);
        lines.push(pattern.description);
        lines.push("");
        lines.push(
            `*Something to sit with:* ${pattern.question ?? "*(Not available for this pattern.)*"}`,
        );
        lines.push(
            `*Try this:* ${pattern.suggestedExperiment ?? "*(Not available for this pattern.)*"}`,
        );
        lines.push("");
    }

    lines.push("---");
    lines.push("");

    return lines.join("\n");
};

export const formatProgressInsight = (insight: ProgressInsight): string => {
    const lines: string[] = [];
    lines.push(
        `## ${formatDate(insight.createdAt, { ...DATE_DISPLAY_LONG, timeZone: "UTC" })}`,
    );
    lines.push("");

    if (insight.parsedContent) {
        const p = insight.parsedContent;
        lines.push(`**${p.headline}**`);
        lines.push("");
        lines.push(`**What's on repeat:** ${p.whatsOnRepeat}`);
        lines.push("");
        lines.push(`**What changed:** ${p.whatChanged}`);
        lines.push("");
        lines.push(`**Reality check:** ${p.realityCheck}`);
        lines.push("");
        lines.push(`**Experiment:** ${p.experiment}`);
        lines.push("");
        lines.push(`**The question:** ${p.theQuestion}`);
        lines.push("");
    } else {
        lines.push(insight.content);
        lines.push("");
    }

    lines.push("---");
    lines.push("");

    return lines.join("\n");
};

export const exportUserData = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ content: string; skippedBatchCount: number }> => {
    let skippedBatchCount = 0;
    const entrySections: string[] = [];
    const weeklySections: string[] = [];
    const progressSections: string[] = [];

    // --- Entries (reverse chronological, already ordered by repo) ---
    let entryPage = 1;
    let entryTotalCount = 0;
    let hasMoreEntries = true;

    while (hasMoreEntries) {
        try {
            const { data, count, error } =
                await getEntriesWithInsightsPaginated(
                    supabase,
                    entryPage,
                    ENTRY_BATCH_SIZE,
                );

            if (error) {
                console.error(
                    `[export] user=${userId} entries batch=${entryPage} query_error:`,
                    error.message,
                );
                captureExportError(error, {
                    userId,
                    domain: "entries",
                    errorType: "query_error",
                    page: entryPage,
                    batchSize: ENTRY_BATCH_SIZE,
                });
                skippedBatchCount++;
                hasMoreEntries = false;
                break;
            }

            if (entryPage === 1) {
                entryTotalCount = count;
            }

            for (const entry of data) {
                entrySections.push(formatEntry(entry));
            }

            hasMoreEntries = data.length === ENTRY_BATCH_SIZE;
            entryPage++;
        } catch (err) {
            console.error(
                `[export] user=${userId} entries batch=${entryPage} transformer_error:`,
                err instanceof Error ? err.message : "unknown",
            );
            captureExportError(err, {
                userId,
                domain: "entries",
                errorType: "transformer_error",
                page: entryPage,
                batchSize: ENTRY_BATCH_SIZE,
            });
            skippedBatchCount++;
            hasMoreEntries = false;
        }
    }

    // --- Weekly patterns (cursor-based) ---
    let weeklyCursor: string | null = null;
    let hasMoreWeekly = true;

    while (hasMoreWeekly) {
        try {
            const { data, nextCursor, error } =
                await findWeeklyInsightWithPatternsPaginated(
                    supabase,
                    weeklyCursor,
                    WEEKLY_BATCH_SIZE,
                );

            if (error) {
                console.error(
                    `[export] user=${userId} weekly cursor=${weeklyCursor} query_error:`,
                    error.message,
                );
                captureExportError(error, {
                    userId,
                    domain: "weekly",
                    errorType: "query_error",
                    cursor: weeklyCursor,
                    batchSize: WEEKLY_BATCH_SIZE,
                });
                skippedBatchCount++;
                hasMoreWeekly = false;
                break;
            }

            for (const weekly of data) {
                const formatted = formatWeeklyInsight(weekly);
                if (formatted) weeklySections.push(formatted);
            }

            weeklyCursor = nextCursor;
            hasMoreWeekly = nextCursor !== null;
        } catch (err) {
            console.error(
                `[export] user=${userId} weekly cursor=${weeklyCursor} transformer_error:`,
                err instanceof Error ? err.message : "unknown",
            );
            captureExportError(err, {
                userId,
                domain: "weekly",
                errorType: "transformer_error",
                cursor: weeklyCursor,
                batchSize: WEEKLY_BATCH_SIZE,
            });
            skippedBatchCount++;
            hasMoreWeekly = false;
        }
    }

    // --- Progress insights ---
    let progressPage = 1;
    let hasMoreProgress = true;

    while (hasMoreProgress) {
        try {
            const { data, error } = await findProgressInsightsPaginated(
                supabase,
                userId,
                progressPage,
                PROGRESS_BATCH_SIZE,
            );

            if (error) {
                console.error(
                    `[export] user=${userId} progress batch=${progressPage} query_error:`,
                    error.message,
                );
                captureExportError(error, {
                    userId,
                    domain: "progress",
                    errorType: "query_error",
                    page: progressPage,
                    batchSize: PROGRESS_BATCH_SIZE,
                });
                skippedBatchCount++;
                hasMoreProgress = false;
                break;
            }

            for (const insight of data) {
                progressSections.push(formatProgressInsight(insight));
            }

            hasMoreProgress = data.length === PROGRESS_BATCH_SIZE;
            progressPage++;
        } catch (err) {
            console.error(
                `[export] user=${userId} progress batch=${progressPage} transformer_error:`,
                err instanceof Error ? err.message : "unknown",
            );
            captureExportError(err, {
                userId,
                domain: "progress",
                errorType: "transformer_error",
                page: progressPage,
                batchSize: PROGRESS_BATCH_SIZE,
            });
            skippedBatchCount++;
            hasMoreProgress = false;
        }
    }

    // --- Assemble document ---
    const exportDate = formatDate(new Date(), DATE_DISPLAY_LONG);
    const headerLines: string[] = [];

    headerLines.push("# Unsaid Journal");
    headerLines.push(
        `Exported ${exportDate} · ${entryTotalCount} ${entryTotalCount === 1 ? "entry" : "entries"}`,
    );
    headerLines.push("");

    if (skippedBatchCount > 0) {
        headerLines.push("> Some entries could not be read and were skipped.");
        headerLines.push(
            "> Your data is still in Unsaid — contact support to recover them.",
        );
        headerLines.push("");
    }

    headerLines.push("---");
    headerLines.push("");

    const parts: string[] = [headerLines.join("\n")];

    if (entrySections.length > 0) {
        parts.push(...entrySections);
    }

    if (weeklySections.length > 0) {
        parts.push("# Weekly Patterns\n\n");
        parts.push(...weeklySections);
    }

    if (progressSections.length > 0) {
        parts.push("# Progress Insights\n\n");
        parts.push(...progressSections);
    }

    return { content: parts.join(""), skippedBatchCount };
};
