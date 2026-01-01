import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { loadEntryThemeTaskPrompt, loadSystemPrompt } from "./prompts";

interface EntryForTheme {
    content: string;
    createdAt: string;
}

/**
 * Format entries for the entry theme prompt.
 * Shows recent entries with dates for context.
 */
const formatEntries = (entries: EntryForTheme[]): string => {
    return entries
        .map((entry, index) => {
            const date = new Date(entry.createdAt);
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            return `[Entry ${index + 1}, ${formattedDate}]\n${entry.content}`;
        })
        .join("\n\n---\n\n");
};

/**
 * Generate a contextual entry theme prompt using Claude Haiku.
 * Returns a single writing prompt based on user's recent entries.
 *
 * @param entries - Last 3-5 entries to base the prompt on
 * @returns Generated prompt text, or null on failure
 */
export const generateEntryThemePrompt = async (
    entries: EntryForTheme[],
): Promise<string | null> => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadEntryThemeTaskPrompt(),
    ]);

    const formattedEntries = formatEntries(entries);

    try {
        const { text } = await generateText({
            model: anthropic("claude-haiku-4-5"),
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: `${taskPrompt}\n${formattedEntries}`,
                },
            ],
        });

        // Clean up the response (remove quotes if present)
        const cleaned = text.trim().replace(/^["']|["']$/g, "");

        return cleaned || null;
    } catch (error) {
        console.error("Failed to generate entry theme prompt:", error);
        return null;
    }
};
