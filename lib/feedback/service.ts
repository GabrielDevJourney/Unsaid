import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackStatusType } from "@/lib/schemas/feedback";
import type {
    FeedbackItem,
    FeedbackItemWithVote,
    ServiceResult,
} from "@/types";
import {
    approveFeedbackItem,
    countUserSubmissionsLast24h,
    deleteUpvote,
    getApprovedFeedbackItemsAdmin,
    getFeedbackItems,
    getPendingFeedbackItems,
    getUserUpvotedIds,
    insertFeedbackItem,
    insertUpvote,
    softRejectFeedbackItem,
    updateAdminReply,
    updateFeedbackStatus,
} from "./repo";

const RATE_LIMIT = 10;

// ─── User-facing ─────────────────────────────────────────────────────────────

export const listFeedbackForUser = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<FeedbackItemWithVote[]>> => {
    const { data, error } = await getFeedbackItems(supabase);
    if (error) throw error;

    const feedbackIds = data.map((i) => i.id);

    const { data: votes } = await getUserUpvotedIds(
        supabase,
        userId,
        feedbackIds,
    );
    const votedSet = new Set((votes ?? []).map((v) => v.feedback_id));

    return {
        data: data.map((item) => ({
            ...item,
            hasVoted: votedSet.has(item.id),
        })),
    };
};

export const submitFeedback = async (
    supabase: SupabaseClient,
    userId: string,
    title: string,
    description: string,
    isAnonymous: boolean,
    authorName: string | null,
    imageUrl: string | null,
): Promise<ServiceResult<null>> => {
    const { count } = await countUserSubmissionsLast24h(supabase, userId);
    if ((count ?? 0) >= RATE_LIMIT) {
        return { error: "rate_limit" };
    }

    const { error } = await insertFeedbackItem(
        supabase,
        userId,
        title,
        description,
        isAnonymous,
        authorName,
        imageUrl,
    );
    if (error) throw error;

    return { data: null };
};

export const checkFeedbackRateLimit = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<boolean> => {
    const { count } = await countUserSubmissionsLast24h(supabase, userId);
    return (count ?? 0) >= RATE_LIMIT;
};

/**
 * Toggle upvote: try INSERT first; if duplicate key (23505) the user already
 * voted — DELETE instead. One fewer round-trip vs. checking first.
 */
export const toggleUpvote = async (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
): Promise<ServiceResult<{ hasVoted: boolean }>> => {
    const { error: insertError } = await insertUpvote(
        supabase,
        userId,
        feedbackId,
    );

    if (insertError) {
        if (insertError.code === "23505") {
            const { error: deleteError } = await deleteUpvote(
                supabase,
                userId,
                feedbackId,
            );
            if (deleteError) throw deleteError;
            return { data: { hasVoted: false } };
        }
        throw insertError;
    }

    return { data: { hasVoted: true } };
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const listPendingFeedback = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<FeedbackItem[]>> => {
    const { data, error } = await getPendingFeedbackItems(supabase);
    if (error) throw error;
    return { data };
};

export const listApprovedFeedbackAdmin = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<FeedbackItem[]>> => {
    const { data, error } = await getApprovedFeedbackItemsAdmin(supabase);
    if (error) throw error;
    return { data };
};

export const approveFeedback = async (
    supabase: SupabaseClient,
    feedbackId: string,
): Promise<ServiceResult<FeedbackItem>> => {
    const { data, error } = await approveFeedbackItem(supabase, feedbackId);
    if (error) {
        if (error.code === "PGRST116") return { error: "Feedback not found" };
        throw error;
    }
    if (!data) throw new Error("approveFeedbackItem returned no data");
    return { data };
};

export const rejectFeedback = async (
    supabase: SupabaseClient,
    feedbackId: string,
    adminUserId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await softRejectFeedbackItem(
        supabase,
        feedbackId,
        adminUserId,
    );
    if (error) throw error;
    return { data: null };
};

export const setFeedbackStatus = async (
    supabase: SupabaseClient,
    feedbackId: string,
    status: FeedbackStatusType,
): Promise<ServiceResult<FeedbackItem>> => {
    const { data, error } = await updateFeedbackStatus(
        supabase,
        feedbackId,
        status,
    );
    if (error) {
        if (error.code === "PGRST116") return { error: "Feedback not found" };
        throw error;
    }
    if (!data) throw new Error("updateFeedbackStatus returned no data");
    return { data };
};

export const setAdminReply = async (
    supabase: SupabaseClient,
    feedbackId: string,
    reply: string,
): Promise<ServiceResult<FeedbackItem>> => {
    const { data, error } = await updateAdminReply(supabase, feedbackId, reply);
    if (error) {
        if (error.code === "PGRST116") return { error: "Feedback not found" };
        throw error;
    }
    if (!data) throw new Error("updateAdminReply returned no data");
    return { data };
};
