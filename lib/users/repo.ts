import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export interface NotificationPreferences {
    notifyWeeklyPatterns: boolean;
    notifyProgressChecks: boolean;
    notifyWritingReminders: boolean;
}

export const createUser = async (
    supabase: SupabaseClient,
    user: {
        id: string;
        email: string;
        username: string;
        subscription_status: string;
    },
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase.from("users").insert({
        user_id: user.id,
        email: user.email,
        username: user.username,
        subscription_status: user.subscription_status,
    });
    return { data: null, error };
};

export const deleteUser = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase
        .from("users")
        .delete()
        .eq("user_id", userId);
    return { data: null, error };
};

/**
 * Mark the user's account for deletion by setting deleted_at = NOW().
 */
export const updateAccountDeletionSchedule = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase
        .from("users")
        .update({ deleted_at: new Date().toISOString() })
        .eq("user_id", userId);
    return { data: null, error };
};

/**
 * Cancel a pending account deletion by clearing deleted_at.
 */
export const updateAccountDeletionCancel = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase
        .from("users")
        .update({ deleted_at: null })
        .eq("user_id", userId);
    return { data: null, error };
};

/**
 * Get the deletion status for the authenticated user.
 * Returns deletedAt (ISO string) if deletion is scheduled, null otherwise.
 */
export const findAccountDeletionStatus = async (
    supabase: SupabaseClient,
): Promise<{
    data: { deletedAt: string | null } | null;
    error: PostgrestError | null;
}> => {
    const { data, error } = await supabase
        .from("users")
        .select("deleted_at")
        .single();

    if (error || !data) {
        return { data: null, error };
    }

    return { data: { deletedAt: data.deleted_at }, error: null };
};

export interface UserScheduledForDeletion {
    user_id: string;
}

/**
 * Find users whose 30-day grace period has expired.
 * Admin-only — used exclusively by the account-deletion cron.
 */
export const findUsersScheduledForDeletion = async (
    supabase: SupabaseClient,
): Promise<{
    data: UserScheduledForDeletion[];
    error: PostgrestError | null;
}> => {
    const cutoff = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .not("deleted_at", "is", null)
        .lt("deleted_at", cutoff);

    if (error || !data) {
        return { data: [], error };
    }

    return { data, error: null };
};

export const createUserProgress = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const { error } = await supabase.from("user_progress").insert({
        user_id: userId,
        total_entries: 0,
    });
    return { data: null, error };
};

/**
 * Get user progress stats.
 * RLS ensures only the authenticated user's row is returned.
 */
export const findUserProgress = async (
    supabase: SupabaseClient,
): Promise<{
    data: { totalEntries: number } | null;
    error: PostgrestError | null;
}> => {
    const { data, error } = await supabase
        .from("user_progress")
        .select("total_entries")
        .single();

    if (error || !data) {
        return { data: null, error };
    }

    return { data: { totalEntries: data.total_entries }, error: null };
};

/**
 * Get notification preferences for the authenticated user.
 * RLS ensures only the current user's row is returned.
 */
export const findNotificationPreferences = async (
    supabase: SupabaseClient,
): Promise<{
    data: NotificationPreferences | null;
    error: PostgrestError | null;
}> => {
    const { data, error } = await supabase
        .from("users")
        .select(
            "notify_weekly_patterns, notify_progress_checks, notify_writing_reminders",
        )
        .single();

    if (error || !data) {
        return { data: null, error };
    }

    return {
        data: {
            notifyWeeklyPatterns: data.notify_weekly_patterns,
            notifyProgressChecks: data.notify_progress_checks,
            notifyWritingReminders: data.notify_writing_reminders,
        },
        error: null,
    };
};

/**
 * Sync email and username from Clerk to DB (called on user.updated webhook).
 */
export const updateUserProfile = async (
    supabase: SupabaseClient,
    userId: string,
    data: { email?: string; username?: string },
) => {
    return supabase
        .from("users")
        .update({
            email: data.email,
            username: data.username,
        })
        .eq("user_id", userId);
};

/**
 * Update notification preferences for a specific user (admin use or RLS-scoped).
 */
export const updateNotificationPreferences = async (
    supabase: SupabaseClient,
    userId: string,
    prefs: Partial<NotificationPreferences>,
) => {
    return supabase
        .from("users")
        .update({
            notify_weekly_patterns: prefs.notifyWeeklyPatterns,
            notify_progress_checks: prefs.notifyProgressChecks,
            notify_writing_reminders: prefs.notifyWritingReminders,
        })
        .eq("user_id", userId);
};

export interface WritingReminderUser {
    user_id: string;
    email: string;
    username: string;
}

/**
 * Get users eligible to receive a writing reminder.
 * Filters: opted in, active/trial subscription, cooldown cleared.
 * Used exclusively by the writing-reminders cron (admin client).
 */
export const findUsersOptedIntoWritingReminders = async (
    supabase: SupabaseClient,
    cooldownDays: number,
): Promise<{ data: WritingReminderUser[]; error: PostgrestError | null }> => {
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

    const { data, error } = await supabase
        .from("users")
        .select("user_id, email, username")
        .eq("notify_writing_reminders", true)
        .in("subscription_status", ["trial", "active"])
        .or(
            `last_writing_reminder_sent_at.is.null,last_writing_reminder_sent_at.lt.${cooldownDate.toISOString()}`,
        );

    if (error || !data) {
        return { data: [], error };
    }

    return { data, error: null };
};

/**
 * Sync subscription_status on the users table to match subscriptions.status.
 * Called after every webhook event that changes subscription state.
 * Uses admin client (bypasses RLS) — only called from webhook/cron contexts.
 */
export const updateUserSubscriptionStatus = async (
    supabase: SupabaseClient,
    userId: string,
    status: string,
) => {
    return supabase
        .from("users")
        .update({ subscription_status: status })
        .eq("user_id", userId);
};

/**
 * Update the last writing reminder sent timestamp for a user.
 */
export const updateLastWritingReminderSent = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase
        .from("users")
        .update({ last_writing_reminder_sent_at: new Date().toISOString() })
        .eq("user_id", userId);
};
