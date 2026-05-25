import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import type { SubscriptionRow } from "@/types/domain/subscriptions";

/**
 * Check if user can use features (create entries, get insights).
 * Allowed when:
 * - status is 'trial' (entry limit enforced separately in entitlements.ts)
 * - status is 'active'
 * - status is 'canceled' but still in paid period
 * - status is 'paused' but still in paid period
 * Not allowed when:
 * - status is 'unpaid' (payment failed)
 * - status is 'expired'
 */
export const canUseFeatures = (subscription: SubscriptionRow): boolean => {
    const { status } = subscription;

    if (status === "trial") return true;

    if (status === "active") return true;

    if (
        (status === "canceled" || status === "paused") &&
        subscription.current_period_end
    ) {
        return new Date() < new Date(subscription.current_period_end);
    }

    return false;
};

/**
 * Check if user can view entries (read-only access).
 * Always allowed - even expired users can view their data.
 */
export const canViewEntries = (subscription: SubscriptionRow): boolean => {
    void subscription;
    return true;
};

/**
 * Check if user can export data.
 * Always allowed - even expired users can export their data.
 */
export const canExportData = (subscription: SubscriptionRow): boolean => {
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
} => {
    return {
        canUseFeatures: canUseFeatures(subscription),
        canViewEntries: canViewEntries(subscription),
        canExportData: canExportData(subscription),
        status: subscription.status as SubscriptionStatusType,
    };
};

/**
 * Check if subscription needs action prompt.
 */
export const needsUpgradePrompt = (subscription: SubscriptionRow): boolean => {
    const { status } = subscription;

    return (
        status === "expired" ||
        status === "canceled" ||
        status === "paused" ||
        status === "unpaid"
    );
};
