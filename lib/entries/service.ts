import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { checkEntryRateLimit } from "@/lib/rate-limit";
import { canUserWriteEntry } from "@/lib/subscriptions/entitlements";
import { checkAndTriggerProgress } from "@/lib/triggers/check-progress-trigger";
import { findUserProgress } from "@/lib/users/repo";
import type {
    CreateEntryPayload,
    Entry,
    EntryReflectionPreview,
    EntryWithAllInsights,
    EntryWithInsight,
    ServiceResult,
} from "@/types";
import {
    deleteEntry,
    findEntriesBySource,
    findEntriesWithInsights,
    findEntriesWithInsightsPaginated,
    findEntryWithAllInsightsById,
    findEntryWithInsightById,
    insertEntry,
    updateEntryContent,
    updateEntryEmbedding,
    updateUserProgressDecrement,
    updateUserProgressIncrement,
} from "./repo";
import { toEntryReflectionPreview } from "./transformers";

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
    const { error } = await updateUserProgressIncrement(supabase, userId);
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
    const [rateLimit, canWrite] = await Promise.all([
        checkEntryRateLimit(supabase, userId),
        canUserWriteEntry(supabase),
    ]);

    if (!rateLimit.allowed) {
        return { error: rateLimit.reason ?? "Rate limit exceeded" };
    }

    if (!canWrite) {
        const { data: progress } = await findUserProgress(supabase);
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

    if (insertError || !entry) {
        return { error: "Failed to create entry" };
    }

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

    void generateAndAttachEmbedding(supabase, entryId, content).catch(
        console.error,
    );

    return { data: entry };
};

export const deleteEntryById = async (
    supabase: SupabaseClient,
    userId: string,
    entryId: string,
): Promise<ServiceResult<null>> => {
    const [deleteResult, progressResult] = await Promise.all([
        deleteEntry(supabase, entryId, userId),
        updateUserProgressDecrement(supabase, userId),
    ]);

    if (deleteResult.error) return { error: "Failed to delete entry" };
    if (progressResult.error) {
        console.error(
            "Failed to decrement user progress:",
            progressResult.error,
        );
    }

    return { data: null };
};

export const getUserEntriesWithInsights = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<EntryWithInsight[]>> => {
    const { data, error } = await findEntriesWithInsights(supabase);

    if (error) {
        return { error: "Failed to fetch entries" };
    }

    return { data };
};

export const getEntryWithInsight = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<ServiceResult<EntryWithInsight>> => {
    const { data, error } = await findEntryWithInsightById(supabase, entryId);

    if (error) {
        if (error.code === "PGRST116") return { error: "entry_not_found" };
        console.error("Failed to fetch entry:", error);
        return { error: "Failed to fetch entry" };
    }

    if (!data) return { error: "entry_not_found" };

    return { data };
};

/**
 * Fetch an entry with ALL insight generations, ordered ASC.
 * Used by the editor page to reconstruct segment layout on reload.
 */
export const getEntryWithAllInsights = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<ServiceResult<EntryWithAllInsights>> => {
    const { data, error } = await findEntryWithAllInsightsById(
        supabase,
        entryId,
    );

    if (error) {
        if (error.code === "PGRST116") return { error: "entry_not_found" };
        console.error("Failed to fetch entry:", error);
        return { error: "Failed to fetch entry" };
    }

    if (!data) return { error: "entry_not_found" };

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
    const sourceTypeResult = z
        .enum(["pattern", "progress"])
        .safeParse(sourceType);
    const sourceIdResult = z.uuid().safeParse(sourceId);
    if (!sourceTypeResult.success || !sourceIdResult.success) {
        return { error: "Invalid source" };
    }

    const { data: rows, error } = await findEntriesBySource(
        supabase,
        sourceType,
        sourceId,
    );

    if (error) return { error: "Failed to fetch reflections" };

    try {
        return { data: rows.map(toEntryReflectionPreview) };
    } catch {
        return { error: "Failed to decrypt reflections" };
    }
};

export const getEntriesWithInsightsPaginated = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    userId?: string,
): Promise<ServiceResult<{ entries: EntryWithInsight[]; count: number }>> => {
    const { data, error, count } = await findEntriesWithInsightsPaginated(
        supabase,
        page,
        pageSize,
        userId,
    );

    if (error) {
        console.error("Failed to fetch paginated entries:", error);
        return { error: "Failed to fetch entries" };
    }

    return { data: { entries: data, count } };
};
