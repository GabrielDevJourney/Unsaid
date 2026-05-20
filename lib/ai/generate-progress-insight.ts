import { anthropic } from "@ai-sdk/anthropic";
import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import {
    type EntryForProgress,
    type ProgressInsightAIOutput,
    ProgressInsightAIOutputSchema,
    type RelatedPastEntry,
} from "@/lib/schemas/progress-insight";
import { loadProgressTaskPrompt, loadSystemPrompt } from "./prompts";

export interface EntryInsightContext {
    entryIndex: number;
    summary: string;
    tags: string[];
}

export interface WeeklyPatternContext {
    title: string;
    description: string;
}

interface GenerateProgressInsightParams {
    recentEntries: EntryForProgress[];
    relatedPastEntries?: RelatedPastEntry[];
    entryInsights?: EntryInsightContext[];
    weeklyPatterns?: WeeklyPatternContext[];
    userName?: string;
    personaContext?: string;
}

const formatRecentEntries = (
    entries: EntryForProgress[],
    insights: EntryInsightContext[],
): string => {
    const insightByIndex = new Map(insights.map((i) => [i.entryIndex, i]));

    return entries
        .map((entry, index) => {
            const date = new Date(entry.createdAt);
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });

            const insight = insightByIndex.get(index);
            const insightLine = insight
                ? `\n  [Insight: ${insight.tags.join(", ")} — ${insight.summary}]`
                : "";

            return `[Entry ${index + 1}, ${formattedDate}] ${entry.content}${insightLine}`;
        })
        .join("\n\n");
};

const formatRelatedPastEntries = (entries: RelatedPastEntry[]): string => {
    if (entries.length === 0) {
        return "No related past entries found.";
    }

    return entries
        .map((entry) => {
            const date = new Date(entry.createdAt);
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            return `[Past entry, ${formattedDate}] ${entry.content}`;
        })
        .join("\n\n");
};

const formatWeeklyPatterns = (patterns: WeeklyPatternContext[]): string => {
    if (patterns.length === 0) return "";

    const lines = patterns
        .map((p) => `- "${p.title}": ${p.description}`)
        .join("\n");
    return `\n\nRecent patterns identified across entries (use as additional context):\n${lines}`;
};

export const generateProgressInsight = async (
    params: GenerateProgressInsightParams,
): Promise<ProgressInsightAIOutput | null> => {
    const {
        recentEntries,
        relatedPastEntries = [],
        entryInsights = [],
        weeklyPatterns = [],
        userName,
        personaContext,
    } = params;

    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadProgressTaskPrompt(),
    ]);

    const personaBlock = personaContext
        ? `\n\n---\n\n## User Context\n${personaContext}`
        : "";

    const formattedRecent = formatRecentEntries(recentEntries, entryInsights);
    const formattedPast = formatRelatedPastEntries(relatedPastEntries);
    const formattedPatterns = formatWeeklyPatterns(weeklyPatterns);

    const userSection = userName ? `User: ${userName}\n` : "";
    const userPrompt = `${taskPrompt}

---

${userSection}Recent ${recentEntries.length} entries (Entry 1 = most recent):
${formattedRecent}

---

Related past entries (for context on recurring patterns):
${formattedPast}${formattedPatterns}`;

    try {
        const { object } = await generateObject({
            model: anthropic("claude-sonnet-4-6"),
            schema: ProgressInsightAIOutputSchema,
            system: `${systemPrompt}${personaBlock}`,
            messages: [{ role: "user", content: userPrompt }],
        });

        return object;
    } catch (error) {
        Sentry.withScope((scope) => {
            scope.setTag("feature", "ai.progress-insight");
            scope.setFingerprint(["ai-failure", "progress-insight"]);
            scope.setContext("ai", {
                entryCount: recentEntries.length,
                model: "claude-sonnet-4-6",
            });
            Sentry.captureException(error);
        });
        console.error("Failed to generate progress insight:", error);
        return null;
    }
};
