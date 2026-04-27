import { clerkClient } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { insertSubscription } from "@/lib/subscriptions/repo";
import { cancelLemonSubscription } from "@/lib/subscriptions/service";
import type { CreateWithProgressPayload, ServiceResult } from "@/types";
import {
    cancelAccountDeletion,
    deleteUser as deleteUserRepo,
    getAccountDeletionStatus as getAccountDeletionStatusRepo,
    getUserProgress as getUserProgressRepo,
    getUsersOptedIntoWritingReminders as getUsersOptedIntoWritingRemindersRepo,
    getUsersScheduledForDeletion,
    insertUser,
    insertUserProgress,
    type NotificationPreferences,
    scheduleAccountDeletion,
    updateLastWritingReminderSent as updateLastWritingReminderSentRepo,
    updateNotificationPreferences as updateNotificationPreferencesRepo,
    updateUserProfile as updateUserProfileRepo,
} from "./repo";

type CreateUserResult = {
    userId: string;
};

/**
 * Create a user and initialize their progress tracking and trial subscription.
 *
 * Handles idempotency: if user already exists (duplicate webhook), succeeds silently.
 * Throws on unexpected DB errors (controller should catch and log).
 */
export const createUserWithProgress = async (
    supabase: SupabaseClient,
    user: CreateWithProgressPayload,
): Promise<ServiceResult<CreateUserResult>> => {
    const { error: userError } = await insertUser(supabase, {
        id: user.id,
        email: user.email,
        username: user.username,
        subscription_status: "trial",
    });

    // 23505 = unique constraint violation (duplicate user from webhook retry)
    if (userError && userError.code !== "23505") {
        throw userError;
    }

    const { error: progressError } = await insertUserProgress(
        supabase,
        user.id,
    );

    if (progressError) {
        await deleteUserRepo(supabase, user.id);
        throw progressError;
    }

    // Create trial subscription
    const { error: subscriptionError } = await insertSubscription(
        supabase,
        user.id,
    );

    // Ignore duplicate constraint (idempotent for webhook retries)
    if (subscriptionError && subscriptionError.code !== "23505") {
        await deleteUserRepo(supabase, user.id);
        throw subscriptionError;
    }

    return { data: { userId: user.id } };
};

/**
 * Update notification preferences for a user.
 */
export const updateNotificationPreferences = async (
    supabase: SupabaseClient,
    userId: string,
    prefs: Partial<NotificationPreferences>,
): Promise<ServiceResult<null>> => {
    const { error } = await updateNotificationPreferencesRepo(
        supabase,
        userId,
        prefs,
    );

    if (error) {
        console.error("Failed to update notification preferences:", error);
        return { error: "Failed to update notification preferences" };
    }

    return { data: null };
};

/**
 * Schedule an account for deletion by setting deleted_at = NOW().
 * Also cancels the Lemon Squeezy subscription immediately (non-blocking —
 * LS keeps access alive until end of billing period regardless).
 */
export const initiateAccountDeletion = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await scheduleAccountDeletion(supabase, userId);
    if (error) {
        return { error: "Failed to schedule account deletion" };
    }

    const lsResult = await cancelLemonSubscription(supabase, userId);
    if ("error" in lsResult) {
        console.error(
            "LS cancellation failed during account deletion initiation — continuing:",
            lsResult.error,
        );
    }

    return { data: null };
};

/**
 * Cancel a pending account deletion by clearing deleted_at.
 */
export const cancelScheduledDeletion = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await cancelAccountDeletion(supabase, userId);
    if (error) {
        return { error: "Failed to cancel account deletion" };
    }
    return { data: null };
};

type DeletionResult = {
    processed: number;
    deleted: number;
    failed: number;
    errors: string[];
};

/**
 * Hard-delete all accounts whose 30-day grace period has expired.
 * Order: Supabase CASCADE delete first, then Clerk (avoids orphaned Clerk accounts).
 * Called exclusively by the account-deletion cron using the admin client.
 */
export const processExpiredDeletions = async (
    supabaseAdmin: SupabaseClient,
): Promise<ServiceResult<DeletionResult>> => {
    const { data: users, error } =
        await getUsersScheduledForDeletion(supabaseAdmin);
    if (error) {
        throw error;
    }

    const result: DeletionResult = {
        processed: users.length,
        deleted: 0,
        failed: 0,
        errors: [],
    };

    for (const user of users) {
        const { error: deleteError } = await deleteUserRepo(
            supabaseAdmin,
            user.user_id,
        );
        if (deleteError) {
            result.failed++;
            result.errors.push(
                `${user.user_id}: DB delete failed — ${deleteError.message}`,
            );
            // Do not attempt Clerk deletion if Supabase failed — avoids orphaned Clerk account with live data
            continue;
        }

        try {
            await (await clerkClient()).users.deleteUser(user.user_id);
        } catch (clerkError) {
            // Supabase data is already gone — log for manual cleanup but treat as success
            console.error(
                `Clerk deletion failed for ${user.user_id} (data already deleted):`,
                clerkError,
            );
        }

        result.deleted++;
    }

    return { data: result };
};

export const deleteUser = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await deleteUserRepo(supabase, userId);
    if (error) {
        console.error("Failed to delete user:", error);
        return { error: "Failed to delete user" };
    }
    return { data: null };
};

export const updateUserProfile = async (
    supabase: SupabaseClient,
    userId: string,
    data: { email?: string; username?: string },
): Promise<ServiceResult<null>> => {
    const { error } = await updateUserProfileRepo(supabase, userId, data);
    if (error) {
        console.error("Failed to update user profile:", error);
        return { error: "Failed to update profile" };
    }
    return { data: null };
};

export const getUserProgress = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<{ totalEntries: number }>> => {
    const { data, error } = await getUserProgressRepo(supabase);
    if (error || !data) {
        return { error: "Failed to fetch user progress" };
    }
    return { data };
};

export const getAccountDeletionStatus = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<{ deletedAt: string | null }>> => {
    const { data, error } = await getAccountDeletionStatusRepo(supabase);
    if (error) {
        console.error("Failed to fetch account deletion status:", error);
        return { error: "Failed to fetch account deletion status" };
    }
    if (!data) {
        return { error: "Failed to fetch account deletion status" };
    }
    return { data };
};

export const getUsersOptedIntoWritingReminders = async (
    supabase: SupabaseClient,
    cooldownDays: number,
) => getUsersOptedIntoWritingRemindersRepo(supabase, cooldownDays);

export const updateLastWritingReminderSent = async (
    supabase: SupabaseClient,
    userId: string,
) => updateLastWritingReminderSentRepo(supabase, userId);
