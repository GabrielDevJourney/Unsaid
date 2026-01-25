import type {
    Entry,
    EntryInsightEmbed,
    EntryMinimal,
    EntryRowEncrypted,
    EntryRowEncryptedMinimal,
    EntryWithSimilarity,
    SearchEntryRowResult,
} from "@/types";
import { decrypt } from "../crypto";

/**
 * Transform encrypted DB row to domain Entry.
 * Decrypts content and converts snake_case to camelCase.
 */
export const toEntry = (entryRow: EntryRowEncrypted): Entry => {
    const content = decrypt({
        encryptedContent: entryRow.encrypted_content ?? "",
        iv: entryRow.content_iv ?? "",
        tag: entryRow.content_tag ?? "",
    });

    return {
        id: entryRow.id,
        userId: entryRow.user_id,
        content,
        wordCount: entryRow.word_count,
        createdAt: entryRow.created_at,
        updatedAt: entryRow.updated_at,
    };
};

/**
 * Transform encrypted entry row to minimal entry.
 * Used for payloads and AI context where full entry isn't needed.
 */
export const toEntryMinimal = (
    entryRow: EntryRowEncryptedMinimal,
): EntryMinimal => {
    const content = decrypt({
        encryptedContent: entryRow.encrypted_content ?? "",
        iv: entryRow.content_iv ?? "",
        tag: entryRow.content_tag ?? "",
    });

    return {
        id: entryRow.id,
        content,
        createdAt: entryRow.created_at,
    };
};

/**
 * Transform encrypted entry insight DB row to domain EntryInsightEmbed.
 */
export const toEntryInsightEmbed = (
    insightRow: EntryRowEncryptedMinimal,
): EntryInsightEmbed => {
    const content = decrypt({
        encryptedContent: insightRow.encrypted_content ?? "",
        iv: insightRow.content_iv ?? "",
        tag: insightRow.content_tag ?? "",
    });

    return {
        id: insightRow.id,
        content,
        createdAt: insightRow.created_at,
    };
};

/**
 * Transform search result row (from RPC) to EntryWithSimilarity.
 */
export const toEntryWithSimilarity = (
    searchRow: SearchEntryRowResult,
): EntryWithSimilarity => {
    const content = decrypt({
        encryptedContent: searchRow.encrypted_content ?? "",
        iv: searchRow.content_iv ?? "",
        tag: searchRow.content_tag ?? "",
    });

    return {
        id: searchRow.id,
        userId: searchRow.user_id,
        content,
        wordCount: searchRow.word_count,
        createdAt: searchRow.created_at,
        updatedAt: searchRow.updated_at,
        similarity: searchRow.similarity,
    };
};
