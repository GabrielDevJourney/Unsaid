import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { Pattern } from "@/lib/schemas/weekly-insight";
import { WeeklyInsightResponseSchema } from "@/lib/schemas/weekly-insight";
import { loadSystemPrompt, loadWeeklyTaskPrompt } from "./prompts";

interface EntryForAnalysis {
    id: string;
    content: string;
    createdAt: string;
}

/**
 * Format entries for the prompt.
 * Format: [entry_id, day] content
 */
const formatEntriesForPrompt = (entries: EntryForAnalysis[]): string => {
    return entries
        .map((entry) => {
            const date = new Date(entry.createdAt);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            return `[${entry.id}, ${day}] ${entry.content}`;
        })
        .join("\n\n");
};

/**
 * Generate weekly insight patterns using Claude Sonnet.
 * Returns validated array of patterns (insight cards).
 *
 * @param entries - Entries from the past week to analyze
 * @returns Array of validated patterns, or empty array on failure
 */
export const generateWeeklyInsight = async (
    entries: EntryForAnalysis[],
): Promise<Pattern[]> => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadWeeklyTaskPrompt(),
    ]);

    const formattedEntries = formatEntriesForPrompt(entries);

    try {
        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-5"),
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: `${taskPrompt}\n${formattedEntries}`,
                },
            ],
        });

        // Parse and validate JSON response
        const parsed = JSON.parse(text);
        const validated = WeeklyInsightResponseSchema.safeParse(parsed);

        if (!validated.success) {
            console.error(
                "Invalid AI response format:",
                validated.error.issues,
            );
            return [];
        }

        return validated.data;
    } catch (error) {
        console.error("Failed to generate weekly insight:", error);
        return [];
    }
};
