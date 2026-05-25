import { currentUser } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_TRIAL_ENTRIES } from "@/lib/constants";
import { countEntriesByUserId } from "@/lib/entries/repo";
import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import { findSubscriptionByUserId } from "@/lib/subscriptions/repo";
import {
    findAccountDeletionStatus,
    findNotificationPreferences,
    type NotificationPreferences,
} from "@/lib/users/repo";

export interface SettingsUser {
    username: string;
    imageUrl: string;
    email: string;
    memberSince: string;
}

export interface SettingsSubscription {
    status: SubscriptionStatusType;
    planName: string | null;
    priceInCents: number | null;
    currentPeriodEnd: string | null;
    trialEntriesUsed: number | null;
    trialEntriesLimit: number | null;
    customerPortalUrl: string | null;
}

export interface SettingsPageData {
    user: SettingsUser;
    subscription: SettingsSubscription;
    notifications: NotificationPreferences;
    deletedAt: string | null;
}

/**
 * Fetch all data needed for the settings page.
 * Returns null if user is not authenticated.
 */
export const getSettingsPageData = async (
    supabase: SupabaseClient,
): Promise<SettingsPageData | null> => {
    const user = await currentUser();
    if (!user) return null;

    const [{ data: sub }, { data: notifPrefs }, { data: deletionStatus }] =
        await Promise.all([
            findSubscriptionByUserId(supabase, user.id),
            findNotificationPreferences(supabase),
            findAccountDeletionStatus(supabase),
        ]);

    const status = sub?.status ?? "trial";

    let trialEntriesUsed: number | null = null;
    if (status === "trial") {
        const { count } = await countEntriesByUserId(supabase, user.id);
        trialEntriesUsed = count;
    }

    return {
        user: {
            username: user.username ?? "",
            imageUrl: user.imageUrl,
            email: user.primaryEmailAddress?.emailAddress ?? "",
            memberSince: new Date(user.createdAt).toISOString(),
        },
        subscription: {
            status,
            planName: sub?.plan_name ?? null,
            priceInCents: sub?.price_in_cents ?? null,
            currentPeriodEnd: sub?.current_period_end ?? null,
            trialEntriesUsed,
            trialEntriesLimit: status === "trial" ? FREE_TRIAL_ENTRIES : null,
            customerPortalUrl: sub?.customer_portal_url ?? null,
        },
        notifications: notifPrefs ?? {
            notifyWritingReminders: true,
            notifyWeeklyPatterns: true,
            notifyProgressChecks: true,
        },
        deletedAt: deletionStatus?.deletedAt ?? null,
    };
};
