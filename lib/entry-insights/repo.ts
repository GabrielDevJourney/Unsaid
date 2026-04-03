import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntryInsight, UpsertEntryInsightData } from "@/types";
import { encrypt } from "../crypto";
import { toEntryInsight } from "./transformers";

const SELECT_FIELDS =
    "id, user_id, entry_id, encrypted_content, content_iv, content_tag, tags, insight_count, created_at, updated_at";

/**
 * Upsert an entry insight (insert or update on conflict entry_id).
 * Encrypts content before storing.
 * RLS will verify the user owns this entry.
 */
export const upsertEntryInsight = async (
    supabase: SupabaseClient,
    data: UpsertEntryInsightData,
): Promise<{ data: EntryInsight | null; error: Error | null }> => {
    const { encryptedContent, iv, tag } = encrypt(data.content);

    const { data: insightRow, error } = await supabase
        .from("entry_insights")
        .upsert(
            {
                user_id: data.userId,
                entry_id: data.entryId,
                encrypted_content: encryptedContent,
                content_iv: iv,
                content_tag: tag,
                tags: data.tags,
                insight_count: data.insightCount,
            },
            { onConflict: "entry_id" },
        )
        .select(SELECT_FIELDS)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toEntryInsight(insightRow), error: null };
};

/**
 * Get entry insights for a batch of entry IDs.
 * Used during progress insight generation (admin client, bypasses RLS).
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
        .in("entry_id", entryIds);

    if (error || !insightRows) {
        return { data: [], error };
    }

    return { data: insightRows.map(toEntryInsight), error: null };
};

/**
 * Get entry insight by entry ID.
 * Returns the insight associated with a specific entry.
 * Decrypts content before returning.
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
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toEntryInsight(insightRow), error: null };
};

/**
 * Get total count of entry insights for the authenticated user.
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
