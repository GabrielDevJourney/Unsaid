import type {
    Entry,
    EntryInsightRowMinimal,
    EntryInsightSummary,
    EntryMinimal,
    EntryRowEncrypted,
    EntryRowEncryptedMinimal,
    EntryRowWithInsights,
    EntryWithInsight,
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
 * Transform insight join row to domain EntryInsightSummary.
 */
export const toEntryInsightSummary = (
    insightRow: EntryInsightRowMinimal,
): EntryInsightSummary => {
    const content = decrypt({
        encryptedContent: insightRow.encrypted_content ?? "",
        iv: insightRow.content_iv ?? "",
        tag: insightRow.content_tag ?? "",
    });

    return {
        id: insightRow.id,
        content,
        tags: insightRow.tags ?? [],
        insightCount: insightRow.insight_count,
        createdAt: insightRow.created_at,
    };
};

/**
 * Transform entry row with nested insight to EntryWithInsight.
 * PostgREST returns a single object for 1:1 FK (UNIQUE constraint) but an
 * array for 1:many. Both cases are handled to be safe.
 */
export const toEntryWithInsight = (
    entryRow: EntryRowWithInsights,
): EntryWithInsight => {
    const entry = toEntry(entryRow);
    const insightData = Array.isArray(entryRow.entry_insights)
        ? entryRow.entry_insights[0]
        : entryRow.entry_insights;
    const insight = insightData ? toEntryInsightSummary(insightData) : null;
    return { ...entry, entryInsight: insight };
};

/**
 * Transform search result row (from RPC) to EntryWithSimilarity.
 * Insight columns are present when the RPC LEFT JOIN finds a matching insight,
 * and null when no insight exists for this entry.
 */
export const toEntryWithSimilarity = (
    searchRow: SearchEntryRowResult,
): EntryWithSimilarity => {
    const content = decrypt({
        encryptedContent: searchRow.encrypted_content ?? "",
        iv: searchRow.content_iv ?? "",
        tag: searchRow.content_tag ?? "",
    });

    const entryInsight = searchRow.insight_id
        ? toEntryInsightSummary({
              id: searchRow.insight_id,
              encrypted_content: searchRow.insight_encrypted_content,
              content_iv: searchRow.insight_content_iv,
              content_tag: searchRow.insight_content_tag,
              tags: searchRow.insight_tags,
              insight_count: searchRow.insight_count ?? 0,
              created_at: searchRow.insight_created_at ?? searchRow.created_at,
          })
        : null;

    return {
        id: searchRow.id,
        userId: searchRow.user_id,
        content,
        wordCount: searchRow.word_count,
        createdAt: searchRow.created_at,
        updatedAt: searchRow.updated_at,
        similarity: searchRow.similarity,
        entryInsight,
    };
};
