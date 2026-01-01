import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { loadEntryTaskPrompt, loadSystemPrompt } from "./prompts";

interface StreamEntryInsightOptions {
    onFinish?: (completion: { text: string }) => Promise<void> | void;
}

/**
 * Stream an entry insight using Claude Haiku.
 *
 * @param entryContent - The journal entry text to analyze
 * @param options - Optional callbacks (onFinish for saving)
 * @returns StreamTextResult from Vercel AI SDK
 */
export const streamEntryInsight = async (
    entryContent: string,
    options?: StreamEntryInsightOptions,
) => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadEntryTaskPrompt(),
    ]);

    return streamText({
        model: anthropic("claude-haiku-4-5"),
        system: systemPrompt,
        messages: [
            {
                role: "user",
                content: `${taskPrompt}\n\n---\n\n${entryContent}`,
            },
        ],
        onFinish: options?.onFinish,
    });
};
