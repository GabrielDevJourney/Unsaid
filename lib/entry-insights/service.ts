import { streamEntryInsight } from "@/lib/ai/stream-entry-insight";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreateEntryInsightPayload } from "@/types/domain/insights";
import { insertEntryInsight } from "./repo";

/**
 * Generate and stream an entry insight.
 * Uses admin client for insert (bypasses RLS - insights are system-created).
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
