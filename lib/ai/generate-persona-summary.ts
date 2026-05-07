import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { loadPrompt, loadSystemPrompt } from "./prompts";

interface InitialSummaryParams {
    displayName: string;
    q1Answer: string;
    q2Answer: string;
    q3Answer: string;
    q4Answer: string;
    firstEntryContent: string;
    firstInsight: string;
}

export const generateInitialPersonaSummary = async (
    params: InitialSummaryParams,
): Promise<string | null> => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadPrompt("tasks/persona-summary.md"),
    ]);

    const prompt = `${taskPrompt}

---

VARIANT: initial

User: ${params.displayName}
Journaling history: ${params.q1Answer}
Current season: ${params.q2Answer}
Looking for: ${params.q3Answer}
When things get hard: ${params.q4Answer}

First entry:
${params.firstEntryContent}

First insight generated:
${params.firstInsight}`;

    try {
        const { text } = await generateText({
            model: anthropic("claude-haiku-4-5"),
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }],
        });
        return text.trim() || null;
    } catch (error) {
        console.error("Failed to generate initial persona summary:", error);
        return null;
    }
};

interface UpdateSummaryParams {
    currentSummary: string;
    displayName: string;
    recentEntries: string[];
    weeklyPatterns?: { title: string; description: string }[];
    progressInsight?: string;
}

export const generateUpdatedPersonaSummary = async (
    params: UpdateSummaryParams,
): Promise<string | null> => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadPrompt("tasks/persona-summary.md"),
    ]);

    const patternsSection =
        params.weeklyPatterns && params.weeklyPatterns.length > 0
            ? `\n\nWeekly patterns observed:\n${params.weeklyPatterns.map((p) => `- "${p.title}": ${p.description}`).join("\n")}`
            : "";

    const progressSection = params.progressInsight
        ? `\n\nProgress insight:\n${params.progressInsight}`
        : "";

    const entriesSection = params.recentEntries
        .slice(0, 5)
        .map((e, i) => `[Entry ${i + 1}] ${e}`)
        .join("\n\n");

    const prompt = `${taskPrompt}

---

VARIANT: update

User: ${params.displayName}

Current summary:
${params.currentSummary}

Recent entries (last 5):
${entriesSection}${patternsSection}${progressSection}`;

    try {
        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-6"),
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }],
        });
        return text.trim() || null;
    } catch (error) {
        console.error("Failed to update persona summary:", error);
        return null;
    }
};
