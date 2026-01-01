import type {
    FeedbackCategoryType,
    FeedbackStatusType,
} from "@/lib/schemas/feedback";

// 1. Raw Types from the Database
export interface Feedback {
    id: string;
    user_id: string;
    parent_id: string | null;
    title: string | null;
    description: string;
    category: FeedbackCategoryType | null;
    status: FeedbackStatusType;
    upvotes: number;
    created_at: string;
    updated_at: string;
}

export interface FeedbackVote {
    user_id: string;
    feedback_id: string;
    created_at: string;
}

// 2. Domain Enums/Unions
export type { FeedbackCategoryType, FeedbackStatusType };

// 3. Service Payloads (Inputs)
export interface InsertFeedbackData {
    userId: string;
    title: string;
    description: string;
    category: FeedbackCategoryType;
}

export interface InsertCommentData {
    userId: string;
    parentId: string;
    description: string;
}

// 4. Enhanced Domain Model (Outputs)
export interface FeedbackWithVoteStatus extends Feedback {
    hasVoted: boolean;
}

export interface FeedbackWithComments extends Feedback {
    comments: Feedback[];
    hasVoted: boolean;
}

export interface PaginatedFeedback {
    data: FeedbackWithVoteStatus[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
}
