import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntryInsight, InsertEntryInsightData } from "@/types";
import { encrypt } from "../crypto";
import { toEntryInsight } from "./transformers";

const SELECT_FIELDS =
    "id, user_id, entry_id, encrypted_content, content_iv, content_tag, tags, generation_order, content_before_length, created_at, updated_at";

/**
 * Insert a new entry insight row.
 * Each generation creates a new row (1:N per entry).
 * Encrypts content before storing.
 */
export const insertEntryInsight = async (
    supabase: SupabaseClient,
    data: InsertEntryInsightData,
): Promise<{ data: EntryInsight | null; error: Error | null }> => {
    const { encryptedContent, iv, tag } = encrypt(data.content);

    const { data: insightRow, error } = await supabase
        .from("entry_insights")
        .insert({
            user_id: data.userId,
            entry_id: data.entryId,
            encrypted_content: encryptedContent,
            content_iv: iv,
            content_tag: tag,
            tags: data.tags,
            generation_order: data.generationOrder,
            content_before_length: data.contentBeforeLength ?? null,
        })
        .select(SELECT_FIELDS)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toEntryInsight(insightRow), error: null };
};

/**
 * Get all insight generations for a single entry, ordered by generation_order ASC.
 * Used by the editor to reconstruct segment layout on reload.
 */
export const getEntryInsightsByEntryId = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: EntryInsight[]; error: Error | null }> => {
    const { data: insightRows, error } = await supabase
        .from("entry_insights")
        .select(SELECT_FIELDS)
        .eq("entry_id", entryId)
        .order("generation_order", { ascending: true });

    if (error || !insightRows) {
        return { data: [], error };
    }

    return { data: insightRows.map(toEntryInsight), error: null };
};

/**
 * Get the latest insight for a single entry (highest generation_order).
 * Used by the AI service to provide context for the next generation.
 * RLS ensures user can only fetch their own entry insights.
 */
export const getEntryInsightByEntryId = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: EntryInsight | null; error: Error | null }> => {
    const { data: insightRow, error } = await supabase
        .from("entry_insights")
        .select(SELECT_FIELDS)
        .eq("entry_id", entryId)
        .order("generation_order", { ascending: false })
        .limit(1)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toEntryInsight(insightRow), error: null };
};

/**
 * Get entry insights for a batch of entry IDs.
 * Used during progress insight generation (admin client, bypasses RLS).
 * Returns all rows — callers pick latest per entry as needed.
 * Decrypts content for each result.
 */
export const getEntryInsightsByEntryIds = async (
    supabase: SupabaseClient,
    entryIds: string[],
): Promise<{ data: EntryInsight[]; error: Error | null }> => {
    if (entryIds.length === 0) return { data: [], error: null };

    const { data: insightRows, error } = await supabase
        .from("entry_insights")
        .select(SELECT_FIELDS)
        .in("entry_id", entryIds)
        .order("generation_order", { ascending: true });

    if (error || !insightRows) {
        return { data: [], error };
    }

    return { data: insightRows.map(toEntryInsight), error: null };
};

/**
 * Get total count of entry insight rows for the authenticated user.
 * RLS ensures only the user's own rows are counted.
 */
export const getTotalInsightsCount = async (
    supabase: SupabaseClient,
): Promise<{ count: number; error: Error | null }> => {
    const { count, error } = await supabase
        .from("entry_insights")
        .select("id", { count: "exact", head: true });

    return { count: count ?? 0, error };
};
