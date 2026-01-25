import type { SupabaseClient } from "@supabase/supabase-js";
import type { EntryInsight, InsertEntryInsightData } from "@/types";
import { encrypt } from "../crypto";
import { toEntryInsight } from "./transformers";

/**
 * Insert a new entry insight into the database.
 * Encrypts content before storing.
 * RLS will verify the user owns this entry.
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
        })
        .select(
            "id, user_id, entry_id, encrypted_content, content_iv, content_tag, created_at, updated_at",
        )
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toEntryInsight(insightRow), error: null };
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
        .select(
            "id, user_id, entry_id, encrypted_content, content_iv, content_tag, created_at, updated_at",
        )
        .eq("entry_id", entryId)
        .single();

    if (error || !insightRow) {
        return { data: null, error };
    }

    return { data: toEntryInsight(insightRow), error: null };
};
