import type { EntryInsight, EntryInsightRowEncrypted } from "@/types";
import { decrypt } from "../crypto";

/**
 * Transform encrypted DB row to domain EntryInsight.
 */
export const toEntryInsight = (
    insightRow: EntryInsightRowEncrypted,
): EntryInsight => {
    const content = decrypt({
        encryptedContent: insightRow.encrypted_content ?? "",
        iv: insightRow.content_iv ?? "",
        tag: insightRow.content_tag ?? "",
    });

    return {
        id: insightRow.id,
        userId: insightRow.user_id,
        entryId: insightRow.entry_id,
        content,
        createdAt: insightRow.created_at,
        updatedAt: insightRow.updated_at,
    };
};
