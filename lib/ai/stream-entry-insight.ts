import { anthropic } from "@ai-sdk/anthropic";
import { Output, smoothStream, streamText } from "ai";
import { type InsightObject, insightSchema } from "@/lib/schemas/entry-insight";
import { loadEntryTaskPrompt, loadSystemPrompt } from "./prompts";

export { insightSchema, type InsightObject };

interface StreamEntryInsightOptions {
    previousInsight?: string;
    previousTags?: string[];
    onFinish?: (event: { text: string }) => Promise<void> | void;
}

/**
 * Stream a structured entry insight using Claude Haiku.
 *
 * Uses streamText + Output.object() instead of streamObject so the model
 * outputs plain JSON text token-by-token (not via tool calls, which Anthropic
 * buffers until complete). This lets useObject on the client receive partial
 * string values and update the UI progressively.
 *
 * smoothStream slows token delivery to word-by-word so fast Haiku responses
 * look like natural typing rather than appearing all at once.
 *
 * @param entryContent - The journal entry text to analyze
 * @param options - Optional previous insight context and onFinish callback
 * @returns StreamTextResult — call .toTextStreamResponse() in the route handler
 */
export const streamEntryInsight = async (
    entryContent: string,
    options?: StreamEntryInsightOptions,
) => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadEntryTaskPrompt(),
    ]);

    const previousContext =
        options?.previousInsight && options?.previousTags
            ? `\n\n---\n\n**Previous insight (refine this):** ${options.previousInsight}\n**Previous tags:** ${options.previousTags.join(", ")}`
            : "";

    return streamText({
        model: anthropic("claude-haiku-4-5"),
        experimental_output: Output.object({ schema: insightSchema }),
        experimental_transform: smoothStream({
            chunking: "word",
            delayInMs: 20,
        }),
        system: systemPrompt,
        messages: [
            {
                role: "user",
                content: `${taskPrompt}\n\n---\n\n${entryContent}${previousContext}`,
            },
        ],
        onFinish: options?.onFinish,
    });
};
