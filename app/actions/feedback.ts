"use server";

import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth/admin";
import {
    approveFeedback,
    rejectFeedback,
    setAdminReply,
    setFeedbackStatus,
    submitFeedback,
    toggleUpvote,
} from "@/lib/feedback/service";
import {
    AdminReplySchema,
    FeedbackIdSchema,
    FeedbackStatusEnum,
    SubmitFeedbackSchema,
} from "@/lib/schemas/feedback";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { FeedbackItem, ServiceResult } from "@/types";

// User actions─

export const submitFeedbackAction = async (
    title: string,
    description: string,
    isAnonymous: boolean,
    authorName: string | null,
    imageUrl: string | null,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const validated = SubmitFeedbackSchema.safeParse({
        title,
        description,
        isAnonymous,
        authorName,
        imageUrl,
    });
    if (!validated.success) {
        return { error: validated.error.issues[0]?.message ?? "Invalid input" };
    }

    try {
        const supabase = await createSupabaseServer();
        return submitFeedback(
            supabase,
            userId,
            validated.data.title,
            validated.data.description,
            validated.data.isAnonymous,
            validated.data.authorName ?? null,
            validated.data.imageUrl ?? null,
        );
    } catch {
        return { error: "Failed to submit feedback" };
    }
};

export const toggleUpvoteAction = async (
    feedbackId: string,
): Promise<ServiceResult<{ hasVoted: boolean }>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = FeedbackIdSchema.safeParse(feedbackId);
    if (!parsed.success) return { error: "Invalid feedback ID" };

    try {
        const supabase = await createSupabaseServer();
        return toggleUpvote(supabase, userId, parsed.data);
    } catch {
        return { error: "Failed to toggle upvote" };
    }
};

// Admin actions

export const approveFeedbackAction = async (
    feedbackId: string,
): Promise<ServiceResult<FeedbackItem>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = FeedbackIdSchema.safeParse(feedbackId);
    if (!parsed.success) return { error: "Invalid feedback ID" };

    const supabase = await createSupabaseServer();
    if (!(await isAdmin(userId, supabase))) return { error: "Unauthorized" };

    try {
        return approveFeedback(supabase, parsed.data);
    } catch {
        return { error: "Failed to approve feedback" };
    }
};

export const rejectFeedbackAction = async (
    feedbackId: string,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = FeedbackIdSchema.safeParse(feedbackId);
    if (!parsed.success) return { error: "Invalid feedback ID" };

    const supabase = await createSupabaseServer();
    if (!(await isAdmin(userId, supabase))) return { error: "Unauthorized" };

    try {
        return rejectFeedback(supabase, parsed.data, userId);
    } catch {
        return { error: "Failed to reject feedback" };
    }
};

export const updateStatusAction = async (
    feedbackId: string,
    status: string,
): Promise<ServiceResult<FeedbackItem>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsedId = FeedbackIdSchema.safeParse(feedbackId);
    if (!parsedId.success) return { error: "Invalid feedback ID" };

    const parsedStatus = FeedbackStatusEnum.safeParse(status);
    if (!parsedStatus.success) return { error: "Invalid status" };

    const supabase = await createSupabaseServer();
    if (!(await isAdmin(userId, supabase))) return { error: "Unauthorized" };

    try {
        return setFeedbackStatus(supabase, parsedId.data, parsedStatus.data);
    } catch {
        return { error: "Failed to update status" };
    }
};

export const addAdminReplyAction = async (
    feedbackId: string,
    reply: string,
): Promise<ServiceResult<FeedbackItem>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsedId = FeedbackIdSchema.safeParse(feedbackId);
    if (!parsedId.success) return { error: "Invalid feedback ID" };

    const validated = AdminReplySchema.safeParse({ reply });
    if (!validated.success) {
        return { error: validated.error.issues[0]?.message ?? "Invalid reply" };
    }

    const supabase = await createSupabaseServer();
    if (!(await isAdmin(userId, supabase))) return { error: "Unauthorized" };

    try {
        return setAdminReply(supabase, parsedId.data, validated.data.reply);
    } catch {
        return { error: "Failed to save reply" };
    }
};
