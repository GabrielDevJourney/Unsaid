import type { ProgressInsight, ProgressInsightRowEncrypted } from "@/types";
import { decrypt } from "../crypto";

// Re-export entry transformers from canonical location
export { toEntry, toEntryMinimal } from "@/lib/entries/transformers";

/**
 * Transform encrypted DB row to domain ProgressInsight.
 */
export const toProgressInsight = (
    insightRow: ProgressInsightRowEncrypted,
): ProgressInsight => {
    const content = decrypt({
        encryptedContent: insightRow.encrypted_content ?? "",
        iv: insightRow.content_iv ?? "",
        tag: insightRow.content_tag ?? "",
    });

    return {
        id: insightRow.id,
        userId: insightRow.user_id,
        content,
        recentEntryIds: insightRow.recent_entry_ids,
        relatedPastEntryIds: insightRow.related_past_entry_ids,
        createdAt: insightRow.created_at,
        updatedAt: insightRow.updated_at,
    };
};
