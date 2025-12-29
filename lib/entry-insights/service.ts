import { streamEntryInsight } from "@/lib/ai/stream-entry-insight";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreateEntryInsightPayload } from "@/types";
import { insertEntryInsight } from "./repo";

/**
 * Generate and stream an entry insight.
 *
 * STREAMING SERVICE: Returns StreamTextResult directly (not ServiceResult).
 * Controller should call result.toTextStreamResponse() to send to client.
 *
 * Uses admin client for DB insert (bypasses RLS - insights are system-created).
 * Saves insight to DB via onFinish callback (errors logged, not thrown).
 *
 * @throws If AI streaming fails
 */
export const generateEntryInsight = async (
    userId: string,
    payload: CreateEntryInsightPayload,
) => {
    const result = await streamEntryInsight(payload.content, {
        onFinish: async (completion) => {
            const supabase = createSupabaseAdmin();

            const { error } = await insertEntryInsight(supabase, {
                userId,
                entryId: payload.entryId,
                content: completion.text,
            });

            if (error) {
                console.error("Failed to save entry insight:", error);
            }
        },
    });

    return result;
};
