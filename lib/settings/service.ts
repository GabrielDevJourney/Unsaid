import { currentUser } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import { getSubscriptionByUserId } from "@/lib/subscriptions/repo";
import {
    getNotificationPreferences,
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
    trialEndsAt: string | null;
    trialDaysRemaining: number | null;
    customerPortalUrl: string | null;
}

export interface SettingsPageData {
    user: SettingsUser;
    subscription: SettingsSubscription;
    notifications: NotificationPreferences;
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

    const [{ data: sub }, { data: notifPrefs }] = await Promise.all([
        getSubscriptionByUserId(supabase, user.id),
        getNotificationPreferences(supabase),
    ]);

    const status = sub?.status ?? "trial";
    const trialEndsAt = sub?.trial_ends_at ?? null;
    const trialDaysRemaining = (() => {
        if (status !== "trial" || !trialEndsAt) return null;
        const diffMs = new Date(trialEndsAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    })();

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
            trialEndsAt,
            trialDaysRemaining,
            customerPortalUrl: sub?.customer_portal_url ?? null,
        },
        notifications: notifPrefs ?? {
            notifyWritingReminders: true,
            notifyWeeklyPatterns: true,
            notifyProgressChecks: true,
        },
    };
};
