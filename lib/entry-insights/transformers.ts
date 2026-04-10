import type { EntryInsight, EntryInsightRowEncrypted } from "@/types";
import { decrypt } from "../crypto";

/**
 * Transform encrypted DB row to domain EntryInsight.
 */
export const toEntryInsight = (
    insightRow: EntryInsightRowEncrypted,
): EntryInsight => {
    const content =
        insightRow.encrypted_content &&
        insightRow.content_iv &&
        insightRow.content_tag
            ? decrypt({
                  encryptedContent: insightRow.encrypted_content,
                  iv: insightRow.content_iv,
                  tag: insightRow.content_tag,
              })
            : "";

    return {
        id: insightRow.id,
        userId: insightRow.user_id,
        entryId: insightRow.entry_id,
        content,
        tags: insightRow.tags ?? [],
        insightCount: insightRow.generation_order,
        generationOrder: insightRow.generation_order,
        contentBeforeLength: insightRow.content_before_length ?? null,
        createdAt: insightRow.created_at,
        updatedAt: insightRow.updated_at,
    };
};
