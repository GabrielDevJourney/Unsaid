import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type {
    EntryForProgress,
    RelatedPastEntry,
} from "@/lib/schemas/progress-insight";
import { loadProgressTaskPrompt, loadSystemPrompt } from "./prompts";

/**
 * Format recent entries for the prompt.
 * Format: [Entry N, date] content
 */
const formatRecentEntries = (entries: EntryForProgress[]): string => {
    return entries
        .map((entry, index) => {
            const date = new Date(entry.createdAt);
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            return `[Entry ${index + 1}, ${formattedDate}] ${entry.content}`;
        })
        .join("\n\n");
};

/**
 * Format related past entries for the prompt.
 * Shows older entries with similarity context.
 */
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

interface GenerateProgressInsightParams {
    recentEntries: EntryForProgress[];
    relatedPastEntries?: RelatedPastEntry[];
    userName?: string;
}

/**
 * Generate a progress insight using Claude Sonnet.
 * Returns structured text (not JSON) following the progress prompt format.
 *
 * @param params - Recent entries, related past entries, and optional user name
 * @returns Generated progress insight text, or null on failure
 */
export const generateProgressInsight = async (
    params: GenerateProgressInsightParams,
): Promise<string | null> => {
    const { recentEntries, relatedPastEntries = [], userName } = params;

    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadProgressTaskPrompt(),
    ]);

    const formattedRecent = formatRecentEntries(recentEntries);
    const formattedPast = formatRelatedPastEntries(relatedPastEntries);

    // Build the user prompt with context
    const userPrompt = buildUserPrompt({
        taskPrompt,
        userName,
        recentEntries: formattedRecent,
        relatedPastEntries: formattedPast,
        entryCount: recentEntries.length,
    });

    try {
        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-20250514"),
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });

        // Validate the response has the expected sections
        if (!validateProgressInsightFormat(text)) {
            console.error("Progress insight missing expected sections");
            return null;
        }

        return text;
    } catch (error) {
        console.error("Failed to generate progress insight:", error);
        return null;
    }
};

/**
 * Build the complete user prompt for progress insight generation.
 */
const buildUserPrompt = ({
    taskPrompt,
    userName,
    recentEntries,
    relatedPastEntries,
    entryCount,
}: {
    taskPrompt: string;
    userName?: string;
    recentEntries: string;
    relatedPastEntries: string;
    entryCount: number;
}): string => {
    const userSection = userName ? `User: ${userName}\n` : "";

    return `${taskPrompt}

---

${userSection}Recent ${entryCount} entries:
${recentEntries}

---

Related past entries (for context on patterns):
${relatedPastEntries}`;
};

/**
 * Validate that the generated text contains expected sections.
 * The progress insight should have specific headers.
 */
const validateProgressInsightFormat = (text: string): boolean => {
    const requiredSections = [
        "THE HEADLINE",
        "WHAT'S ON REPEAT",
        "WHAT CHANGED",
        "THE REALITY CHECK",
        "Experiment Suggestion",
        "THE QUESTION",
    ];

    // Check that at least 4 of 6 sections are present
    // (allows for some flexibility in AI output)
    const foundSections = requiredSections.filter((section) =>
        text.includes(section),
    );

    return foundSections.length >= 4;
};
