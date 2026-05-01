import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackStatusType } from "@/lib/schemas/feedback";
import type { FeedbackItem } from "@/types";

// submitted_by / rejected_by are intentionally excluded — never returned to the client
const ITEM_COLS =
    "id, title, description, status, upvote_count, is_approved, is_anonymous, author_name, image_url, admin_reply, admin_reply_at, rejected_at, created_at";

// ─── User-facing reads ───────────────────────────────────────────────────────

export const findFeedbackItems = async (
    supabase: SupabaseClient,
): Promise<{ data: FeedbackItem[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .select(ITEM_COLS)
        .eq("is_approved", true)
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false });
    return { data: (data ?? []) as FeedbackItem[], error };
};

export const findUserUpvotedIds = (
    supabase: SupabaseClient,
    userId: string,
    feedbackIds: string[],
) => {
    if (feedbackIds.length === 0)
        return Promise.resolve({ data: [], error: null });
    // feedback_upvotes RLS allows reading all rows (public vote counts are visible),
    // so .eq("user_id") is required here to scope results to the current user
    return supabase
        .from("feedback_upvotes")
        .select("feedback_id")
        .eq("user_id", userId)
        .in("feedback_id", feedbackIds);
};

// ─── Rate limit ──────────────────────────────────────────────────────────────

export const countUserSubmissionsLast24h = (
    supabase: SupabaseClient,
    userId: string,
) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    // feedback_items has a permissive read policy (public board), so .eq("submitted_by")
    // is required to scope the rate-limit count to the current user
    return supabase
        .from("feedback_items")
        .select("id", { count: "exact", head: true })
        .eq("submitted_by", userId)
        .gte("created_at", since);
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const createFeedbackItem = async (
    supabase: SupabaseClient,
    userId: string,
    title: string,
    description: string,
    isAnonymous: boolean,
    authorName: string | null,
    imageUrl: string | null,
): Promise<{ data: FeedbackItem | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .insert({
            submitted_by: userId,
            title,
            description,
            is_anonymous: isAnonymous,
            author_name: isAnonymous ? null : authorName,
            image_url: imageUrl ?? null,
        })
        .select(ITEM_COLS)
        .single();
    return { data: data as FeedbackItem | null, error };
};

export const createUpvote = (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
) =>
    supabase
        .from("feedback_upvotes")
        .insert({ user_id: userId, feedback_id: feedbackId });

export const deleteUpvote = (
    supabase: SupabaseClient,
    userId: string,
    feedbackId: string,
) =>
    supabase
        .from("feedback_upvotes")
        .delete()
        .eq("user_id", userId)
        .eq("feedback_id", feedbackId);

// ─── Admin reads ─────────────────────────────────────────────────────────────

export const findPendingFeedbackItems = async (
    supabase: SupabaseClient,
): Promise<{ data: FeedbackItem[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .select(ITEM_COLS)
        .eq("is_approved", false)
        .is("rejected_at", null)
        .order("created_at", { ascending: true });
    return { data: (data ?? []) as FeedbackItem[], error };
};

export const findApprovedFeedbackItems = async (
    supabase: SupabaseClient,
): Promise<{ data: FeedbackItem[]; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .select(ITEM_COLS)
        .eq("is_approved", true)
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false });
    return { data: (data ?? []) as FeedbackItem[], error };
};

// ─── Admin mutations ─────────────────────────────────────────────────────────

export const updateFeedbackItemApproval = async (
    supabase: SupabaseClient,
    feedbackId: string,
): Promise<{ data: FeedbackItem | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .update({ is_approved: true })
        .eq("id", feedbackId)
        .select(ITEM_COLS)
        .single();
    return { data: data as FeedbackItem | null, error };
};

// Soft-delete: records who rejected and when; row is preserved for audit history
export const updateFeedbackItemRejection = async (
    supabase: SupabaseClient,
    feedbackId: string,
    adminUserId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase
        .from("feedback_items")
        .update({
            status: "rejected" as FeedbackStatusType,
            rejected_at: new Date().toISOString(),
            rejected_by: adminUserId,
        })
        .eq("id", feedbackId);
    return { data: null, error };
};

export const updateFeedbackStatus = async (
    supabase: SupabaseClient,
    feedbackId: string,
    status: FeedbackStatusType,
): Promise<{ data: FeedbackItem | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .update({ status })
        .eq("id", feedbackId)
        .select(ITEM_COLS)
        .single();
    return { data: data as FeedbackItem | null, error };
};

// admin_reply_at is set automatically by the DB trigger on feedback_items
export const updateAdminReply = async (
    supabase: SupabaseClient,
    feedbackId: string,
    reply: string,
): Promise<{ data: FeedbackItem | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("feedback_items")
        .update({ admin_reply: reply })
        .eq("id", feedbackId)
        .select(ITEM_COLS)
        .single();
    return { data: data as FeedbackItem | null, error };
};
