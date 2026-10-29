import { anthropic } from "@ai-sdk/anthropic";
import * as Sentry from "@sentry/nextjs";
import { Output, smoothStream, streamText } from "ai";
import { type InsightObject, insightSchema } from "@/lib/schemas/entry-insight";
import { HAIKU_MODEL, SONNET_MODEL, SONNET_PROVIDER_OPTIONS } from "./models";
import { loadEntryTaskPrompt, loadSystemPrompt } from "./prompts";

export { insightSchema, type InsightObject };

interface StreamEntryInsightOptions {
    previousInsight?: string;
    previousTags?: string[];
    reflectionContext?: string;
    personaContext?: string;
    onFinish?: (event: { text: string }) => Promise<void> | void;
}

export const streamEntryInsight = async (
    entryContent: string,
    options?: StreamEntryInsightOptions,
) => {
    const [systemPrompt, taskPrompt] = await Promise.all([
        loadSystemPrompt(),
        loadEntryTaskPrompt(),
    ]);

    const personaBlock = options?.personaContext
        ? `\n\n---\n\n## User Context\n${options.personaContext}`
        : "";

    const previousContext =
        options?.previousInsight && options?.previousTags
            ? `\n\n---\n\n**Previous insight (refine this):** ${options.previousInsight}\n**Previous tags:** ${options.previousTags.join(", ")}`
            : "";

    const contextBlock = options?.reflectionContext
        ? `\n\n---\n\n${options.reflectionContext}`
        : "";

    const model = options?.reflectionContext
        ? anthropic(SONNET_MODEL)
        : anthropic(HAIKU_MODEL);

    return streamText({
        model,
        providerOptions: options?.reflectionContext
            ? SONNET_PROVIDER_OPTIONS
            : undefined,
        experimental_output: Output.object({ schema: insightSchema }),
        experimental_transform: smoothStream({
            chunking: "word",
            delayInMs: 20,
        }),
        system: `${systemPrompt}${personaBlock}`,
        messages: [
            {
                role: "user",
                content: `${taskPrompt}\n\n---\n\n${entryContent}${previousContext}${contextBlock}`,
            },
        ],
        onFinish: options?.onFinish,
        onError: (event) => {
            Sentry.withScope((scope) => {
                scope.setTag("feature", "ai.entry-insight");
                scope.setFingerprint(["ai-failure", "entry-insight"]);
                scope.setContext("ai", {
                    model: options?.reflectionContext
                        ? SONNET_MODEL
                        : HAIKU_MODEL,
                    hasReflectionContext: !!options?.reflectionContext,
                });
                Sentry.captureException(event.error);
            });
            console.error("streamEntryInsight error:", event.error);
        },
    });
};
