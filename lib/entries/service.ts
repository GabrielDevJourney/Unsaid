import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { decrypt } from "@/lib/crypto";
import { checkEntryRateLimit } from "@/lib/rate-limit";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { checkAndTriggerProgress } from "@/lib/triggers/check-progress-trigger";
import { getUserProgress } from "@/lib/users/repo";
import type {
    CreateEntryPayload,
    Entry,
    EntryReflectionPreview,
    EntryWithInsight,
    ServiceResult,
} from "@/types";
import {
    decrementUserProgress,
    deleteEntry,
    getEntriesBySource,
    getEntriesWithInsights,
    getEntryWithInsightById,
    incrementUserProgress,
    insertEntry,
    updateEntryContent,
    updateEntryEmbedding,
} from "./repo";

const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).filter(Boolean).length;
};

const generateAndAttachEmbedding = async (
    supabase: SupabaseClient,
    entryId: string,
    content: string,
): Promise<void> => {
    try {
        const embedding = await generateEmbedding(content);
        const { error } = await updateEntryEmbedding(
            supabase,
            entryId,
            embedding,
        );
        if (error) console.error("Failed to update embedding:", error);
    } catch (err) {
        console.error("Failed to generate embedding:", err);
    }
};

const updateProgress = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<void> => {
    const { error } = await incrementUserProgress(supabase, userId);
    if (error) console.error("Failed to increment user progress:", error);

    void checkAndTriggerProgress(userId).then((result) => {
        if (result.data?.triggered) {
            console.log(
                `[Progress] Auto-triggered insight for user ${userId}: ${result.data.reason}`,
            );
        }
    });
};

export const createEntry = async (
    supabase: SupabaseClient,
    userId: string,
    payload: CreateEntryPayload,
): Promise<ServiceResult<Entry>> => {
    const rateLimit = await checkEntryRateLimit(supabase, userId);
    if (!rateLimit.allowed) {
        return { error: rateLimit.reason ?? "Rate limit exceeded" };
    }

    const canWrite = await canUserWriteEntry(supabase);
    if (!canWrite) {
        const { data: progress } = await getUserProgress(supabase);
        // Fail closed: if progress is unavailable (DB error), deny rather than allow.
        if (!progress || progress.totalEntries >= 15) {
            return { error: "FREE_LIMIT_REACHED" };
        }
    }

    const wordCount = calculateWordCount(payload.content);

    const { data: entry, error: insertError } = await insertEntry(supabase, {
        userId,
        content: payload.content,
        wordCount,
        sourceType: payload.sourceType ?? null,
        sourceId: payload.sourceId ?? null,
    });

    if (insertError) throw insertError;
    if (!entry) throw new Error("Entry was not created");

    await Promise.all([
        generateAndAttachEmbedding(supabase, entry.id, payload.content),
        updateProgress(supabase, userId),
    ]);

    return { data: entry };
};

export const saveEntry = async (
    supabase: SupabaseClient,
    entryId: string,
    userId: string,
    content: string,
): Promise<ServiceResult<Entry>> => {
    const wordCount = calculateWordCount(content);

    const { data: entry, error } = await updateEntryContent(
        supabase,
        entryId,
        userId,
        { content, wordCount },
    );

    if (error || !entry) {
        return { error: "Failed to save entry" };
    }

    void generateAndAttachEmbedding(supabase, entryId, content);

    return { data: entry };
};

export const deleteEntryById = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await deleteEntry(supabase, entryId, userId);
    if (error) return { error: "Failed to delete entry" };

    const { error: progressError } = await decrementUserProgress(
        supabase,
        userId,
    );
    if (progressError) {
        console.error("Failed to decrement user progress:", progressError);
    }

    return { data: null };
};

export const getUserEntriesWithInsights = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<EntryWithInsight[]>> => {
    const { data, error } = await getEntriesWithInsights(supabase);

    if (error) {
        return { error: "Failed to fetch entries" };
    }

    return { data };
};

export const getEntryWithInsight = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<ServiceResult<EntryWithInsight>> => {
    const { data, error } = await getEntryWithInsightById(supabase, entryId);

    if (error || !data) {
        return { error: "Entry not found" };
    }

    return { data };
};

/**
 * Fetch compact entry previews linked to a source (pattern or progress insight).
 * Fetches entries linked to a source and decrypts their Tier 1 insight prose.
 * Used to render the "Your reflections" accordion on pattern/progress detail pages.
 */
export const getEntryReflectionPreviews = async (
    supabase: SupabaseClient,
    sourceType: string,
    sourceId: string,
): Promise<ServiceResult<EntryReflectionPreview[]>> => {
    const { data: rows, error } = await getEntriesBySource(
        supabase,
        sourceType,
        sourceId,
    );

    if (error) return { error: "Failed to fetch reflections" };

    try {
        const previews: EntryReflectionPreview[] = rows.map((row) => {
            // Supabase returns 1:1 joins as a single object at runtime despite the TS array type
            const insightRaw = row.entry_insights;
            const insight = Array.isArray(insightRaw)
                ? (insightRaw[0] ?? null)
                : (insightRaw ?? null);
            let insightContent: string | null = null;
            if (insight?.encrypted_content) {
                insightContent = decrypt({
                    encryptedContent: insight.encrypted_content,
                    iv: insight.content_iv ?? "",
                    tag: insight.content_tag ?? "",
                });
            }
            return {
                id: row.id,
                createdAt: row.created_at,
                wordCount: row.word_count,
                insightContent,
            };
        });

        return { data: previews };
    } catch {
        return { error: "Failed to decrypt reflections" };
    }
};
