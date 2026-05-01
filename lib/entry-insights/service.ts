import type { SupabaseClient } from "@supabase/supabase-js";
import { streamEntryInsight } from "@/lib/ai/stream-entry-insight";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { findEntryEncryptedFields } from "@/lib/entries/repo";
import { decryptEntryContent } from "@/lib/entries/transformers";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ServiceResult } from "@/types";
import {
    countEntryInsights,
    createEntryInsight,
    findEntryInsightsByEntryId,
} from "./repo";

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
    // Verify ownership and fetch encrypted content via repo (RLS-scoped).
    const serverSupabase = await createSupabaseServer();
    const { data: encryptedRow, error: entryError } =
        await findEntryEncryptedFields(serverSupabase, entryId);

    if (entryError || !encryptedRow) return null;
    if (
        !encryptedRow.encrypted_content ||
        !encryptedRow.content_iv ||
        !encryptedRow.content_tag
    ) {
        return null;
    }

    // Decryption via transformer — never inline in services.
    const content = decryptEntryContent(encryptedRow);

    // Character count of content at generation time — used to split segments on reload
    const contentBeforeLength = content.length;

    const supabase = createSupabaseAdmin();

    const { data: existingInsights } = await findEntryInsightsByEntryId(
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
                console.error("Entry insight generation produced invalid JSON");
                return;
            }

            const { error } = await createEntryInsight(supabase, {
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

export const getTotalInsightsCount = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<number>> => {
    const { count, error } = await countEntryInsights(supabase);

    if (error) {
        console.error("Failed to get total insights count:", error);
        return { error: "Failed to get total insights count" };
    }

    return { data: count };
};
