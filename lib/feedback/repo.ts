import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    FeedbackSortType,
    FeedbackStatusType,
} from "@/lib/schemas/feedback";
import type { Feedback, InsertCommentData, InsertFeedbackData } from "@/types";

/**
 * Insert a new feedback post.
 */
export const insertFeedback = async (
    supabase: SupabaseClient,
    data: InsertFeedbackData,
) => {
    return supabase
        .from("feedback")
        .insert({
            user_id: data.userId,
            title: data.title,
            description: data.description,
            category: data.category,
        })
        .select()
        .single();
};

/**
 * Insert a comment on feedback.
 */
export const insertComment = async (
    supabase: SupabaseClient,
    data: InsertCommentData,
) => {
    return supabase
        .from("feedback")
        .insert({
            user_id: data.userId,
            parent_id: data.parentId,
            description: data.description,
            // Comments don't have title, category, or status
        })
        .select()
        .single();
};

/**
 * Get feedback by ID.
 */
export const getFeedbackById = async (
    supabase: SupabaseClient,
    feedbackId: string,
) => {
    return supabase.from("feedback").select("*").eq("id", feedbackId).single();
};

/**
 * Get paginated feedback list with sorting and filtering.
 * Only returns top-level posts (parent_id IS NULL).
 */
export const getFeedbackList = async (
    supabase: SupabaseClient,
    page: number,
    pageSize: number,
    sort: FeedbackSortType,
    status: FeedbackStatusType | "all",
) => {
    const offset = (page - 1) * pageSize;

    let query = supabase
        .from("feedback")
        .select("*", { count: "exact" })
        .is("parent_id", null); // Only top-level posts

    // Filter by status
    if (status !== "all") {
        query = query.eq("status", status);
    }

    // Sort
    if (sort === "votes") {
        query = query.order("upvotes", { ascending: false });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    return query.range(offset, offset + pageSize - 1);
};

/**
 * Get comments for a feedback post.
 */
export const getCommentsByParentId = async (
    supabase: SupabaseClient,
    parentId: string,
) => {
    return supabase
        .from("feedback")
        .select("*")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
};

/**
 * Update feedback status (admin only).
 */
export const updateFeedbackStatus = async (
    supabase: SupabaseClient,
    feedbackId: string,
    status: FeedbackStatusType,
) => {
    return supabase
        .from("feedback")
        .update({ status })
        .eq("id", feedbackId)
        .select()
        .single();
};

/**
 * Check if user has voted on feedback.
 */
export const getUserVote = async (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
) => {
    return supabase
        .from("feedback_votes")
        .select("*")
        .eq("user_id", userId)
        .eq("feedback_id", feedbackId)
        .maybeSingle();
};

/**
 * Get all votes by user for a list of feedback IDs.
 * Used to check hasVoted status in bulk.
 */
export const getUserVotesForFeedbackIds = async (
    supabase: SupabaseClient,
    userId: string,
    feedbackIds: string[],
) => {
    if (feedbackIds.length === 0) {
        return { data: [], error: null };
    }

    return supabase
        .from("feedback_votes")
        .select("feedback_id")
        .eq("user_id", userId)
        .in("feedback_id", feedbackIds);
};

/**
 * Insert a vote.
 */
export const insertVote = async (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
) => {
    return supabase.from("feedback_votes").insert({
        user_id: userId,
        feedback_id: feedbackId,
    });
};

/**
 * Delete a vote (unvote).
 */
export const deleteVote = async (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
) => {
    return supabase
        .from("feedback_votes")
        .delete()
        .eq("user_id", userId)
        .eq("feedback_id", feedbackId);
};

/**
 * Increment upvotes count on feedback.
 */
export const incrementUpvotes = async (
    supabase: SupabaseClient,
    feedbackId: string,
) => {
    // Get current upvotes
    const { data: feedback } = await supabase
        .from("feedback")
        .select("upvotes")
        .eq("id", feedbackId)
        .single();

    const currentUpvotes = (feedback as Feedback | null)?.upvotes ?? 0;

    return supabase
        .from("feedback")
        .update({ upvotes: currentUpvotes + 1 })
        .eq("id", feedbackId)
        .select("upvotes")
        .single();
};

/**
 * Decrement upvotes count on feedback.
 */
export const decrementUpvotes = async (
    supabase: SupabaseClient,
    feedbackId: string,
) => {
    // Get current upvotes
    const { data: feedback } = await supabase
        .from("feedback")
        .select("upvotes")
        .eq("id", feedbackId)
        .single();

    const currentUpvotes = (feedback as Feedback | null)?.upvotes ?? 0;

    return supabase
        .from("feedback")
        .update({ upvotes: Math.max(0, currentUpvotes - 1) })
        .eq("id", feedbackId)
        .select("upvotes")
        .single();
};
