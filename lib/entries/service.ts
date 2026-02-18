import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { checkEntryRateLimit } from "@/lib/rate-limit";
import { checkAndTriggerProgress } from "@/lib/triggers/check-progress-trigger";
import type {
    CreateEntryPayload,
    Entry,
    EntryWithInsight,
    ServiceResult,
} from "@/types";
import {
    getEntriesWithInsights,
    incrementUserProgress,
    insertEntry,
    updateEntryEmbedding,
} from "./repo";

const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).filter(Boolean).length;
};

const attachEmbedding = async (
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

    const wordCount = calculateWordCount(payload.content);

    const { data: entry, error: insertError } = await insertEntry(supabase, {
        userId,
        content: payload.content,
        wordCount,
    });

    if (insertError) throw insertError;
    if (!entry) throw new Error("Entry was not created");

    await attachEmbedding(supabase, entry.id, payload.content);
    await updateProgress(supabase, userId);

    return { data: entry };
};

export const getUserEntriesWithInsights = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<EntryWithInsight[]>> => {
    const { data, error } = await getEntriesWithInsights(supabase);

    if (error) {
        throw error;
    }

    return { data };
};
