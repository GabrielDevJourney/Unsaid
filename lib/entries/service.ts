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

/**
 * Calculate word count by splitting on whitespace.
 */
const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Create a new journal entry with embedding generation.
 *
 * Flow:
 * 1. Check rate limit
 * 2. Calculate word count
 * 3. Insert entry (without embedding)
 * 4. Generate embedding async (non-blocking)
 * 5. Update entry with embedding
 * 6. Increment user_progress.total_entries
 * 7. Return created entry
 *
 * Returns error for expected failures (rate limit).
 * Throws for unexpected DB errors.
 */
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

    // Insert entry (without embedding initially)
    const { data: entry, error: insertError } = await insertEntry(supabase, {
        userId,
        content: payload.content,
        wordCount,
    });

    if (insertError) {
        console.error("Failed to insert entry:", insertError);
        throw insertError;
    }

    if (!entry) {
        throw new Error("Entry was not created");
    }

    // Generate embedding async - don't block entry creation
    try {
        const embedding = await generateEmbedding(payload.content);

        const { error: embeddingError } = await updateEntryEmbedding(
            supabase,
            entry.id,
            embedding,
        );

        if (embeddingError) {
            // Log but don't fail - embedding can be regenerated later
            console.error("Failed to update embedding:", embeddingError);
        }
    } catch (embeddingError) {
        // Log but don't fail - embedding can be regenerated later
        console.error("Failed to generate embedding:", embeddingError);
    }

    const { error: progressError } = await incrementUserProgress(
        supabase,
        userId,
    );

    if (progressError) {
        // Log but don't fail - progress can be reconciled later
        console.error("Failed to increment user progress:", progressError);
    }

    // Check if progress insight should be triggered (async, non-blocking)
    // Using void to explicitly indicate fire-and-forget pattern
    void checkAndTriggerProgress(userId).then((result) => {
        if (result.data?.triggered) {
            console.log(
                `[Progress] Auto-triggered insight for user ${userId}: ${result.data.reason}`,
            );
        }
    });

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
