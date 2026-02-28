import { streamEntryInsight } from "@/lib/ai/stream-entry-insight";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreateEntryInsightPayload } from "@/types";
import { getEntryInsightByEntryId, upsertEntryInsight } from "./repo";

/**
 * Generate and stream a structured entry insight.
 *
 * STREAMING SERVICE: Returns StreamObjectResult directly (not ServiceResult).
 * Controller should call result.toTextStreamResponse() to send to client.
 *
 * Uses admin client for DB upsert (bypasses RLS - insights are system-created).
 * Saves insight and tags to DB via onFinish callback (errors logged, not thrown).
 *
 * Enforces max 3 regenerations per entry. Returns null if limit reached.
 *
 * @throws If AI streaming fails
 */
export const generateEntryInsight = async (
    userId: string,
    payload: CreateEntryInsightPayload,
) => {
    const supabase = createSupabaseAdmin();

    const { data: existing } = await getEntryInsightByEntryId(
        supabase,
        payload.entryId,
    );

    if (existing && existing.insightCount >= MAX_INSIGHT_COUNT) {
        return null;
    }

    const newCount = existing ? existing.insightCount + 1 : 1;
    const previousInsight = existing?.content;
    const previousTags = existing?.tags;

    const result = await streamEntryInsight(payload.content, {
        previousInsight,
        previousTags,
        onFinish: async ({ text }) => {
            let parsed: { insight: string; tags: string[] } | undefined;

            try {
                parsed = JSON.parse(text) as {
                    insight: string;
                    tags: string[];
                };
            } catch {
                console.error(
                    "Entry insight generation produced invalid JSON",
                    text,
                );
                return;
            }

            const { error } = await upsertEntryInsight(supabase, {
                userId,
                entryId: payload.entryId,
                content: parsed.insight,
                tags: parsed.tags ?? [],
                insightCount: newCount,
            });

            if (error) {
                console.error("Failed to save entry insight:", error);
            }
        },
    });

    return result;
};
