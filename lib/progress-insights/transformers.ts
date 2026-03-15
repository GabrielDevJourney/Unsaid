import type {
    ProgressInsight,
    ProgressInsightRowEncrypted,
    ProgressInsightStructured,
} from "@/types";
import { decrypt } from "../crypto";

// Re-export entry transformers from canonical location
export { toEntry, toEntryMinimal } from "@/lib/entries/transformers";

/** Raw JSON shape stored in DB / returned by AI (snake_case keys). */
interface RawProgressInsightJSON {
    headline: string;
    whats_on_repeat: string;
    what_changed: string;
    reality_check: string;
    experiment: string;
    the_question: string;
    key_entry_numbers: number[];
    is_milestone?: boolean;
}

/**
 * Try to parse decrypted content as structured JSON (new format).
 * Maps snake_case AI/DB keys to camelCase domain fields.
 * Returns null for old text-format records.
 */
const parseStructuredContent = (
    content: string,
): ProgressInsightStructured | null => {
    try {
        const parsed = JSON.parse(content) as unknown;
        if (
            parsed !== null &&
            typeof parsed === "object" &&
            "headline" in parsed &&
            typeof (parsed as Record<string, unknown>).headline === "string"
        ) {
            const raw = parsed as RawProgressInsightJSON;
            return {
                headline: raw.headline,
                whatsOnRepeat: raw.whats_on_repeat,
                whatChanged: raw.what_changed,
                realityCheck: raw.reality_check,
                experiment: raw.experiment,
                theQuestion: raw.the_question,
                keyEntryNumbers: raw.key_entry_numbers,
                isMilestone: raw.is_milestone ?? false,
            };
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Transform encrypted DB row to domain ProgressInsight.
 * Attempts to parse structured JSON content; falls back to null for old records.
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
        parsedContent: parseStructuredContent(content),
        isViewed: insightRow.is_viewed,
        recentEntryIds: insightRow.recent_entry_ids,
        relatedPastEntryIds: insightRow.related_past_entry_ids,
        keyEntryIds: insightRow.key_entry_ids,
        createdAt: insightRow.created_at,
        updatedAt: insightRow.updated_at,
    };
};
