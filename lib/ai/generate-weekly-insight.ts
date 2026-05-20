import { anthropic } from "@ai-sdk/anthropic";
import * as Sentry from "@sentry/nextjs";
import { generateText } from "ai";
import type { Pattern } from "@/lib/schemas/weekly-insight";
import { WeeklyInsightResponseSchema } from "@/lib/schemas/weekly-insight";
import { generatePatternTypesPromptSection } from "../constants/pattern-types";
import { loadSystemPrompt, loadWeeklyTaskPrompt } from "./prompts";

interface EntryForAnalysis {
    id: string;
    content: string;
    createdAt: string;
}

const formatEntriesForPrompt = (entries: EntryForAnalysis[]): string => {
    return entries
        .map((entry) => {
            const date = new Date(entry.createdAt);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            return `[${entry.id}, ${day}] ${entry.content}`;
        })
        .join("\n\n");
};

export const generateWeeklyInsight = async (
    entries: EntryForAnalysis[],
    personaContext?: string,
): Promise<Pattern[]> => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadWeeklyTaskPrompt(),
    ]);

    const personaBlock = personaContext
        ? `\n\n---\n\n## User Context\n${personaContext}`
        : "";

    const formattedEntries = formatEntriesForPrompt(entries);
    const patternTypesSection = generatePatternTypesPromptSection();
    const finalPrompt = `${taskPrompt}\n\n${patternTypesSection}\n\nEntries to analyze:\n${formattedEntries}`;

    try {
        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-6"),
            system: `${systemPrompt}${personaBlock}`,
            messages: [
                {
                    role: "user",
                    content: finalPrompt,
                },
            ],
        });

        const jsonText = text
            .replace(/^```(?:json)?\s*\n?/i, "")
            .replace(/\n?```\s*$/i, "")
            .trim();

        const parsed = JSON.parse(jsonText);
        const validated = WeeklyInsightResponseSchema.safeParse(parsed);

        if (!validated.success) {
            console.error(
                "Invalid AI response format:",
                validated.error.issues.map((i) => i.message),
            );
            return [];
        }

        return validated.data;
    } catch (error) {
        Sentry.withScope((scope) => {
            scope.setTag("feature", "ai.weekly-insight");
            scope.setFingerprint(["ai-failure", "weekly-insight"]);
            scope.setContext("ai", {
                entryCount: entries.length,
                model: "claude-sonnet-4-6",
            });
            Sentry.captureException(error);
        });
        console.error("Failed to generate weekly insight:", error);
        return [];
    }
};
