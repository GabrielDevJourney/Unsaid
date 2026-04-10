import type { FeedbackStatusType } from "@/lib/schemas/feedback";

export type { FeedbackStatusType };

// Raw shape returned from DB (submitted_by / rejected_by are never selected)
export interface FeedbackItem {
    id: string;
    title: string;
    description: string;
    status: FeedbackStatusType;
    upvote_count: number;
    is_approved: boolean;
    is_anonymous: boolean;
    author_name: string | null;
    image_url: string | null;
    admin_reply: string | null;
    admin_reply_at: string | null;
    rejected_at: string | null;
    created_at: string;
}

// Augmented with the current user's vote state (set server-side)
export interface FeedbackItemWithVote extends FeedbackItem {
    hasVoted: boolean;
}
