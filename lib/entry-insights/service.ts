import { streamEntryInsight } from "@/lib/ai/stream-entry-insight";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { decrypt } from "@/lib/crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getEntryInsightByEntryId, upsertEntryInsight } from "./repo";

/**
 * Generate and stream a structured entry insight.
 *
 * STREAMING SERVICE: Returns StreamObjectResult directly (not ServiceResult).
 * Controller should call result.toTextStreamResponse() to send to client.
 *
 * Ownership verification: fetches entry via server client (RLS-scoped).
 * If the entry does not belong to the authenticated user, returns null.
 *
 * Uses admin client for DB upsert (bypasses RLS - insights are system-created).
 * Saves insight and tags to DB via onFinish callback (errors logged, not thrown).
 *
 * Enforces max 3 regenerations per entry. Returns null if limit reached.
 *
 * @throws If AI streaming fails
 */
export const generateEntryInsight = async (userId: string, entryId: string) => {
    // Verify ownership and fetch content server-side.
    // createSupabaseServer injects the Clerk session token — RLS ensures only
    // the authenticated user's own entries are returned. If the entry doesn't
    // belong to this user (or doesn't exist), data will be null and we bail.
    const serverSupabase = await createSupabaseServer();
    const { data: entryRow } = await serverSupabase
        .from("entries")
        .select("encrypted_content, content_iv, content_tag")
        .eq("id", entryId)
        .single();

    if (!entryRow) return null;

    const content = decrypt({
        encryptedContent: entryRow.encrypted_content,
        iv: entryRow.content_iv,
        tag: entryRow.content_tag,
    });

    const supabase = createSupabaseAdmin();

    const { data: existing } = await getEntryInsightByEntryId(
        supabase,
        entryId,
    );

    if (existing && existing.insightCount >= MAX_INSIGHT_COUNT) {
        return null;
    }

    const newCount = existing ? existing.insightCount + 1 : 1;
    const previousInsight = existing?.content;
    const previousTags = existing?.tags;

    const result = await streamEntryInsight(content, {
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
                entryId,
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
