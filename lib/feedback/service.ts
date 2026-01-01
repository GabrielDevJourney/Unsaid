import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    FeedbackCategoryType,
    FeedbackSortType,
    FeedbackStatusType,
} from "@/lib/schemas/feedback";
import type {
    Feedback,
    FeedbackWithVoteStatus,
    PaginatedFeedback,
    ServiceResult,
} from "@/types";
import {
    decrementUpvotes,
    deleteVote,
    getFeedbackById,
    getFeedbackList,
    getUserVote,
    getUserVotesForFeedbackIds,
    incrementUpvotes,
    insertComment,
    insertFeedback,
    insertVote,
    updateFeedbackStatus,
} from "./repo";

/**
 * Create a new feedback post.
 */
export const createFeedback = async (
    supabase: SupabaseClient,
    userId: string,
    title: string,
    description: string,
    category: FeedbackCategoryType,
): Promise<ServiceResult<Feedback>> => {
    const { data, error } = await insertFeedback(supabase, {
        userId,
        title,
        description,
        category,
    });

    if (error) {
        console.error("Failed to create feedback:", error);
        throw error;
    }

    return { data: data as Feedback };
};

/**
 * Create a comment on feedback.
 */
export const createComment = async (
    supabase: SupabaseClient,
    userId: string,
    parentId: string,
    description: string,
): Promise<ServiceResult<Feedback>> => {
    // Verify parent exists
    const { data: parent, error: parentError } = await getFeedbackById(
        supabase,
        parentId,
    );

    if (parentError || !parent) {
        return { error: "Feedback not found" };
    }

    const { data, error } = await insertComment(supabase, {
        userId,
        parentId,
        description,
    });

    if (error) {
        console.error("Failed to create comment:", error);
        throw error;
    }

    return { data: data as Feedback };
};

/**
 * Get paginated feedback list with vote status.
 */
export const listFeedback = async (
    supabase: SupabaseClient,
    userId: string,
    page: number,
    pageSize: number,
    sort: FeedbackSortType,
    status: FeedbackStatusType | "all",
): Promise<PaginatedFeedback> => {
    const {
        data: feedbackList,
        count,
        error,
    } = await getFeedbackList(supabase, page, pageSize, sort, status);

    if (error) {
        console.error("Failed to list feedback:", error);
        throw error;
    }

    const feedback = (feedbackList as Feedback[]) ?? [];
    const total = count ?? 0;
    const offset = (page - 1) * pageSize;

    // Get user's votes for these feedback items
    const feedbackIds = feedback.map((f) => f.id);
    const { data: votes } = await getUserVotesForFeedbackIds(
        supabase,
        userId,
        feedbackIds,
    );

    const votedIds = new Set((votes ?? []).map((v) => v.feedback_id));

    // Add hasVoted status
    const feedbackWithVotes: FeedbackWithVoteStatus[] = feedback.map((f) => ({
        ...f,
        hasVoted: votedIds.has(f.id),
    }));

    return {
        data: feedbackWithVotes,
        pagination: {
            page,
            pageSize,
            total,
            hasMore: total > offset + pageSize,
        },
    };
};

/**
 * Toggle vote on feedback.
 * If already voted, removes vote. If not voted, adds vote.
 * Returns new upvote count.
 */
export const toggleVote = async (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
): Promise<ServiceResult<{ upvotes: number; hasVoted: boolean }>> => {
    // Verify feedback exists
    const { data: feedback, error: feedbackError } = await getFeedbackById(
        supabase,
        feedbackId,
    );

    if (feedbackError || !feedback) {
        return { error: "Feedback not found" };
    }

    // Check if user already voted
    const { data: existingVote } = await getUserVote(
        supabase,
        userId,
        feedbackId,
    );

    if (existingVote) {
        // Remove vote
        await deleteVote(supabase, userId, feedbackId);
        const { data: updated } = await decrementUpvotes(supabase, feedbackId);
        return {
            data: {
                upvotes: (updated as { upvotes: number } | null)?.upvotes ?? 0,
                hasVoted: false,
            },
        };
    }

    // Add vote
    const { error: voteError } = await insertVote(supabase, userId, feedbackId);

    if (voteError) {
        // Could be duplicate key if race condition - treat as already voted
        if (voteError.code === "23505") {
            return { error: "Already voted" };
        }
        console.error("Failed to insert vote:", voteError);
        throw voteError;
    }

    const { data: updated } = await incrementUpvotes(supabase, feedbackId);

    return {
        data: {
            upvotes: (updated as { upvotes: number } | null)?.upvotes ?? 0,
            hasVoted: true,
        },
    };
};

/**
 * Update feedback status (admin only).
 */
export const setFeedbackStatus = async (
    supabase: SupabaseClient,
    feedbackId: string,
    status: FeedbackStatusType,
): Promise<ServiceResult<Feedback>> => {
    const { data, error } = await updateFeedbackStatus(
        supabase,
        feedbackId,
        status,
    );

    if (error) {
        if (error.code === "PGRST116") {
            return { error: "Feedback not found" };
        }
        console.error("Failed to update feedback status:", error);
        throw error;
    }

    return { data: data as Feedback };
};
