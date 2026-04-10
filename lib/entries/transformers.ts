import type {
    Entry,
    EntryInsightRowMinimal,
    EntryInsightSummary,
    EntryMinimal,
    EntryReflectionPreview,
    EntryRowEncrypted,
    EntryRowEncryptedMinimal,
    EntryRowWithInsights,
    EntrySourceRow,
    EntryWithAllInsights,
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
    const content =
        entryRow.encrypted_content &&
        entryRow.content_iv &&
        entryRow.content_tag
            ? decrypt({
                  encryptedContent: entryRow.encrypted_content,
                  iv: entryRow.content_iv,
                  tag: entryRow.content_tag,
              })
            : "";

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
    const content =
        entryRow.encrypted_content &&
        entryRow.content_iv &&
        entryRow.content_tag
            ? decrypt({
                  encryptedContent: entryRow.encrypted_content,
                  iv: entryRow.content_iv,
                  tag: entryRow.content_tag,
              })
            : "";

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
        content,
        tags: insightRow.tags ?? [],
        insightCount: insightRow.generation_order,
        generationOrder: insightRow.generation_order,
        contentBeforeLength: insightRow.content_before_length ?? null,
        createdAt: insightRow.created_at,
    };
};

/**
 * Normalize the entry_insights join result to a sorted array.
 * PostgREST may return a single object or an array depending on constraint state.
 */
const normalizeInsights = (
    raw: EntryInsightRowMinimal | EntryInsightRowMinimal[] | null,
): EntryInsightRowMinimal[] => {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.sort((a, b) => a.generation_order - b.generation_order);
};

/**
 * Transform entry row with nested insight to EntryWithInsight.
 * Returns only the latest insight (highest generation_order) for list views, cards, etc.
 */
export const toEntryWithInsight = (
    entryRow: EntryRowWithInsights,
): EntryWithInsight => {
    const entry = toEntry(entryRow);
    const sorted = normalizeInsights(entryRow.entry_insights);
    const latest = sorted.at(-1);
    const insight = latest ? toEntryInsightSummary(latest) : null;
    return { ...entry, entryInsight: insight };
};

/**
 * Transform entry row with all nested insights to EntryWithAllInsights.
 * Returns all insight generations ordered ASC — used by the editor only.
 */
export const toEntryWithAllInsights = (
    entryRow: EntryRowWithInsights,
): EntryWithAllInsights => {
    const entry = toEntry(entryRow);
    const sorted = normalizeInsights(entryRow.entry_insights);
    const entryInsights = sorted.map(toEntryInsightSummary);
    const latest = entryInsights.at(-1) ?? null;
    return { ...entry, entryInsight: latest, entryInsights };
};

/**
 * Transform search result row (from RPC) to EntryWithSimilarity.
 * Insight columns are present when the RPC LEFT JOIN finds a matching insight,
 * and null when no insight exists for this entry.
 */
export const toEntryWithSimilarity = (
    searchRow: SearchEntryRowResult,
): EntryWithSimilarity => {
    const content =
        searchRow.encrypted_content &&
        searchRow.content_iv &&
        searchRow.content_tag
            ? decrypt({
                  encryptedContent: searchRow.encrypted_content,
                  iv: searchRow.content_iv,
                  tag: searchRow.content_tag,
              })
            : "";

    const entryInsight = searchRow.insight_id
        ? toEntryInsightSummary({
              id: searchRow.insight_id,
              encrypted_content: searchRow.insight_encrypted_content,
              content_iv: searchRow.insight_content_iv,
              content_tag: searchRow.insight_content_tag,
              tags: searchRow.insight_tags,
              generation_order: searchRow.insight_count ?? 1,
              content_before_length: null,
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

/**
 * Transform an EntrySourceRow (entries + nested insight join) to EntryReflectionPreview.
 * Handles Supabase's runtime 1:1 join shape (single object despite TS array type).
 * Decrypts insight prose if present; returns null if no insight exists.
 */
export const toEntryReflectionPreview = (
    row: EntrySourceRow,
): EntryReflectionPreview => {
    // Supabase returns 1:1 joins as a single object at runtime despite the TS array type
    const insightRaw = row.entry_insights;
    const insight = Array.isArray(insightRaw)
        ? (insightRaw[0] ?? null)
        : (insightRaw ?? null);

    const insightContent =
        insight?.encrypted_content && insight.content_iv && insight.content_tag
            ? decrypt({
                  encryptedContent: insight.encrypted_content,
                  iv: insight.content_iv,
                  tag: insight.content_tag,
              })
            : null;

    return {
        id: row.id,
        createdAt: row.created_at,
        wordCount: row.word_count,
        insightContent,
    };
};
