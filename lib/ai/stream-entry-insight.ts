import { anthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { z } from "zod";
import { INSIGHT_TAG_TYPES } from "@/lib/constants/insight-tag-types";
import { loadEntryTaskPrompt, loadSystemPrompt } from "./prompts";

export const insightSchema = z.object({
    insight: z.string(),
    tags: z.array(z.enum(INSIGHT_TAG_TYPES)).max(3),
});

export type InsightObject = z.infer<typeof insightSchema>;

interface StreamEntryInsightOptions {
    onFinish?: (event: {
        object: InsightObject | undefined;
    }) => Promise<void> | void;
}

/**
 * Stream a structured entry insight using Claude Haiku.
 * Returns { insight: string, tags: string[] } as a streamed object.
 *
 * @param entryContent - The journal entry text to analyze
 * @param options - Optional callbacks (onFinish for saving)
 * @returns StreamObjectResult from Vercel AI SDK
 */
export const streamEntryInsight = async (
    entryContent: string,
    options?: StreamEntryInsightOptions,
) => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadEntryTaskPrompt(),
    ]);

    return streamObject({
        model: anthropic("claude-haiku-4-5"),
        schema: insightSchema,
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
