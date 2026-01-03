import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import type { SubscriptionRow } from "@/types/domain/subscriptions";

export const TRIAL_DAYS = 7;

/**
 * Check if trial is currently active.
 */
export const isTrialActive = (subscription: SubscriptionRow): boolean => {
    if (subscription.status !== "trial") return false;
    if (!subscription.trial_ends_at) return false;

    return new Date() < new Date(subscription.trial_ends_at);
};

/**
 * Check if trial has expired.
 */
export const isTrialExpired = (subscription: SubscriptionRow): boolean => {
    if (subscription.status !== "trial") return false;
    if (!subscription.trial_ends_at) return true;

    return new Date() >= new Date(subscription.trial_ends_at);
};

/**
 * Get days remaining in trial. Returns null if not on trial.
 */
export const getTrialDaysRemaining = (
    subscription: SubscriptionRow,
): number | null => {
    if (subscription.status !== "trial") return null;
    if (!subscription.trial_ends_at) return 0;

    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    const diffMs = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};

/**
 * Check if user can use features (create entries, get insights).
 * Allowed when:
 * - status is 'trial' (and not expired)
 * - status is 'active'
 * - status is 'canceled' but still in paid period
 */
export const canUseFeatures = (subscription: SubscriptionRow): boolean => {
    const { status } = subscription;

    if (status === "trial") {
        return isTrialActive(subscription);
    }

    if (status === "active") {
        return true;
    }

    if (status === "canceled" && subscription.current_period_end) {
        return new Date() < new Date(subscription.current_period_end);
    }

    return false;
};

/**
 * Check if user can view entries (read-only access).
 * Always allowed - even expired users can view their data.
 */
export const canViewEntries = (subscription: SubscriptionRow): boolean => {
    // Always true - all users can view their entries
    void subscription;
    return true;
};

/**
 * Check if user can export data.
 * Always allowed - even expired users can export their data.
 */
export const canExportData = (subscription: SubscriptionRow): boolean => {
    // Always true - all users can export their data
    void subscription;
    return true;
};

/**
 * Get access status summary for UI display.
 */
export const getAccessStatus = (
    subscription: SubscriptionRow,
): {
    canUseFeatures: boolean;
    canViewEntries: boolean;
    canExportData: boolean;
    status: SubscriptionStatusType;
    trialDaysRemaining: number | null;
    isTrialExpired: boolean;
} => {
    return {
        canUseFeatures: canUseFeatures(subscription),
        canViewEntries: canViewEntries(subscription),
        canExportData: canExportData(subscription),
        status: subscription.status as SubscriptionStatusType,
        trialDaysRemaining: getTrialDaysRemaining(subscription),
        isTrialExpired: isTrialExpired(subscription),
    };
};

/**
 * Check if subscription needs upgrade prompt (trial expiring or expired).
 */
export const needsUpgradePrompt = (subscription: SubscriptionRow): boolean => {
    const { status } = subscription;

    if (status === "expired") return true;

    if (status === "trial") {
        const daysRemaining = getTrialDaysRemaining(subscription);
        return daysRemaining !== null && daysRemaining <= 3;
    }

    if (status === "canceled") return true;

    return false;
};
