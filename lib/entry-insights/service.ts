import { streamEntryInsight } from "@/lib/ai/stream-entry-insight";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { decrypt } from "@/lib/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getEntryInsightsByEntryId, insertEntryInsight } from "./repo";

/**
 * Generate and stream a structured entry insight.
 *
 * STREAMING SERVICE: Returns StreamObjectResult directly (not ServiceResult).
 * Controller should call result.toTextStreamResponse() to send to client.
 *
 * Ownership verification: fetches entry via server client (RLS-scoped).
 * If the entry does not belong to the authenticated user, returns null.
 *
 * Uses admin client for DB insert (bypasses RLS - insights are system-created).
 * Saves insight to DB via onFinish callback (errors logged, not thrown).
 *
 * Enforces max MAX_INSIGHT_COUNT generations per entry. Returns null if limit reached.
 *
 * @throws If AI streaming fails
 */
export const generateEntryInsight = async (
    userId: string,
    entryId: string,
    reflectionContext?: string,
) => {
    // Verify ownership and fetch content server-side.
    const serverSupabase = await createSupabaseServer();
    const { data: entryRow } = await serverSupabase
        .from("entries")
        .select("encrypted_content, content_iv, content_tag")
        .eq("id", entryId)
        .single();

    if (!entryRow) return null;
    if (
        !entryRow.encrypted_content ||
        !entryRow.content_iv ||
        !entryRow.content_tag
    ) {
        return null;
    }

    const content = decrypt({
        encryptedContent: entryRow.encrypted_content,
        iv: entryRow.content_iv,
        tag: entryRow.content_tag,
    });

    // Character count of content at generation time — used to split segments on reload
    const contentBeforeLength = content.length;

    const supabase = createSupabaseAdmin();

    const { data: existingInsights } = await getEntryInsightsByEntryId(
        supabase,
        entryId,
    );

    if (existingInsights && existingInsights.length >= MAX_INSIGHT_COUNT) {
        return null;
    }

    const existing = existingInsights ?? [];
    const newGenerationOrder = existing.length + 1;
    const previousInsight = existing.at(-1)?.content;
    const previousTags = existing.at(-1)?.tags;

    const result = await streamEntryInsight(content, {
        previousInsight,
        previousTags,
        reflectionContext,
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

            const { error } = await insertEntryInsight(supabase, {
                userId,
                entryId,
                content: parsed.insight,
                tags: parsed.tags ?? [],
                generationOrder: newGenerationOrder,
                contentBeforeLength,
            });

            if (error) {
                console.error("Failed to save entry insight:", error);
            }
        },
    });

    return result;
};
