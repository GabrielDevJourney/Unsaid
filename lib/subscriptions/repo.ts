import type { SupabaseClient } from "@supabase/supabase-js";
import { TRIAL_DAYS } from "@/lib/constants";
import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import type { Json } from "@/types/database";

/**
 * Insert a new subscription (trial by default).
 */
export const insertSubscription = async (
    supabase: SupabaseClient,
    userId: string,
    trialDays: number = TRIAL_DAYS,
) => {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    return supabase
        .from("subscriptions")
        .insert({
            user_id: userId,
            status: "trial",
            trial_ends_at: trialEndsAt.toISOString(),
        })
        .select()
        .single();
};

/**
 * Get subscription by user ID.
 */
export const getSubscriptionByUserId = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();
};

/**
 * Get subscription by Lemon Squeezy subscription ID.
 */
export const getSubscriptionByLemonId = async (
    supabase: SupabaseClient,
    lemonSubscriptionId: string,
) => {
    return supabase
        .from("subscriptions")
        .select("*")
        .eq("lemon_subscription_id", lemonSubscriptionId)
        .single();
};

/**
 * Get user by email (for webhook processing).
 */
export const getUserByEmail = async (
    supabase: SupabaseClient,
    email: string,
) => {
    return supabase.from("users").select("user_id").eq("email", email).single();
};

/**
 * Update subscription status.
 */
export const updateSubscriptionStatus = async (
    supabase: SupabaseClient,
    userId: string,
    status: SubscriptionStatusType,
) => {
    return supabase
        .from("subscriptions")
        .update({ status })
        .eq("user_id", userId)
        .select()
        .single();
};

/**
 * Update subscription with Lemon Squeezy data.
 */
export const updateSubscriptionFromWebhook = async (
    supabase: SupabaseClient,
    userId: string,
    data: {
        status: SubscriptionStatusType;
        lemonSubscriptionId?: string;
        lemonCustomerId?: string;
        currentPeriodEnd?: string;
        canceledAt?: string | null;
        customerPortalUrl?: string;
    },
) => {
    return supabase
        .from("subscriptions")
        .update({
            status: data.status,
            lemon_subscription_id: data.lemonSubscriptionId,
            lemon_customer_id: data.lemonCustomerId,
            current_period_end: data.currentPeriodEnd,
            canceled_at: data.canceledAt,
            customer_portal_url: data.customerPortalUrl,
        })
        .eq("user_id", userId)
        .select()
        .single();
};

/**
 * Insert a payment event for idempotency tracking.
 */
export const insertPaymentEvent = async (
    supabase: SupabaseClient,
    data: {
        userId?: string;
        eventType: string;
        lemonEventId: string;
        payload: Json;
    },
) => {
    return supabase
        .from("payment_events")
        .insert({
            user_id: data.userId,
            event_type: data.eventType,
            lemon_event_id: data.lemonEventId,
            payload: data.payload,
            processed_at: new Date().toISOString(),
        })
        .select()
        .single();
};

/**
 * Check if payment event was already processed (idempotency).
 */
export const getPaymentEventByLemonId = async (
    supabase: SupabaseClient,
    lemonEventId: string,
) => {
    return supabase
        .from("payment_events")
        .select("id")
        .eq("lemon_event_id", lemonEventId)
        .maybeSingle();
};

/**
 * Get trial subscriptions expiring within N days (for reminder emails).
 */
export const getExpiringTrials = async (
    supabase: SupabaseClient,
    daysUntilExpiry: number,
) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntilExpiry);

    // Get subscriptions expiring on that day (within 24h window)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return supabase
        .from("subscriptions")
        .select("user_id, trial_ends_at")
        .eq("status", "trial")
        .gte("trial_ends_at", startOfDay.toISOString())
        .lte("trial_ends_at", endOfDay.toISOString());
};

/**
 * Get expired trial subscriptions (for status update cron).
 */
export const getExpiredTrials = async (supabase: SupabaseClient) => {
    return supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "trial")
        .lt("trial_ends_at", new Date().toISOString());
};
