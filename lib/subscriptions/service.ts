import type { SupabaseClient } from "@supabase/supabase-js";
import { TRIAL_DAYS } from "@/lib/constants";
import {
    isSubscriptionEvent,
    type LemonWebhookInput,
    mapLemonToInternalStatus,
} from "@/lib/schemas/subscription";
import type { ServiceResult } from "@/types";
import type { Json } from "@/types/database";
import type { SubscriptionRow } from "@/types/domain/subscriptions";
import {
    getPaymentEventByLemonId,
    getSubscriptionByUserId,
    getUserByEmail,
    insertPaymentEvent,
    insertSubscription,
    updateSubscriptionFromWebhook,
    updateSubscriptionStatus,
} from "./repo";

/**
 * Create a trial subscription for a new user.
 */
export const createTrialSubscription = async (
    supabase: SupabaseClient,
    userId: string,
    trialDays: number = TRIAL_DAYS,
): Promise<ServiceResult<SubscriptionRow>> => {
    const { data, error } = await insertSubscription(
        supabase,
        userId,
        trialDays,
    );

    // Handle duplicate (idempotent for webhook retries)
    if (error?.code === "23505") {
        const { data: existing } = await getSubscriptionByUserId(
            supabase,
            userId,
        );
        if (existing) {
            return { data: existing as SubscriptionRow };
        }
    }

    if (error) {
        console.error("Failed to create trial subscription:", error);
        throw error;
    }

    return { data: data as SubscriptionRow };
};

/**
 * Get subscription for a user.
 */
export const getSubscription = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<SubscriptionRow>> => {
    const { data, error } = await getSubscriptionByUserId(supabase, userId);

    if (error?.code === "PGRST116") {
        return { error: "Subscription not found" };
    }

    if (error) {
        console.error("Failed to get subscription:", error);
        throw error;
    }

    return { data: data as SubscriptionRow };
};

/**
 * Process a Lemon Squeezy webhook event.
 * Returns true if processed successfully, false if already processed.
 */
export const processWebhookEvent = async (
    supabase: SupabaseClient,
    webhookId: string,
    payload: LemonWebhookInput,
): Promise<ServiceResult<{ processed: boolean }>> => {
    const eventType = payload.meta.event_name;

    // Check idempotency - already processed?
    const { data: existingEvent } = await getPaymentEventByLemonId(
        supabase,
        webhookId,
    );

    if (existingEvent) {
        return { data: { processed: false } };
    }

    // Only handle subscription events (not payment invoices)
    if (!isSubscriptionEvent(eventType)) {
        // Store but don't process unknown events
        await insertPaymentEvent(supabase, {
            eventType,
            lemonEventId: webhookId,
            payload: payload as unknown as Json,
        });
        return { data: { processed: true } };
    }

    // Find user by email from webhook
    const userEmail = payload.data.attributes.user_email;
    const { data: user, error: userError } = await getUserByEmail(
        supabase,
        userEmail,
    );

    if (userError || !user) {
        // Try custom_data user_id if email not found
        const customUserId = payload.meta.custom_data?.user_id;
        if (!customUserId) {
            console.error("User not found for webhook:", userEmail);
            return { error: `User not found: ${userEmail}` };
        }
        // Use custom_data user_id
        return processSubscriptionUpdate(
            supabase,
            customUserId,
            webhookId,
            eventType,
            payload,
        );
    }

    return processSubscriptionUpdate(
        supabase,
        user.user_id,
        webhookId,
        eventType,
        payload,
    );
};

/**
 * Process subscription update from webhook.
 */
const processSubscriptionUpdate = async (
    supabase: SupabaseClient,
    userId: string,
    webhookId: string,
    eventType: string,
    payload: LemonWebhookInput,
): Promise<ServiceResult<{ processed: boolean }>> => {
    const attrs = payload.data.attributes;

    // Map Lemon status to our internal status
    const internalStatus = mapLemonToInternalStatus(
        attrs.status,
        attrs.cancelled,
    );

    // Update subscription
    const { error: updateError } = await updateSubscriptionFromWebhook(
        supabase,
        userId,
        {
            status: internalStatus,
            lemonSubscriptionId: payload.data.id,
            lemonCustomerId: String(attrs.customer_id),
            currentPeriodEnd: attrs.renews_at ?? attrs.ends_at ?? undefined,
            canceledAt: attrs.cancelled ? new Date().toISOString() : null,
        },
    );

    if (updateError) {
        console.error("Failed to update subscription:", updateError);
        throw updateError;
    }

    // Record event for audit/idempotency
    await insertPaymentEvent(supabase, {
        userId,
        eventType,
        lemonEventId: webhookId,
        payload: payload as unknown as Json,
    });

    return { data: { processed: true } };
};

/**
 * Mark expired trials as expired status.
 * Called by cron job.
 */
export const expireTrials = async (
    supabase: SupabaseClient,
): Promise<ServiceResult<{ count: number }>> => {
    const { data: expiredTrials, error } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "trial")
        .lt("trial_ends_at", new Date().toISOString());

    if (error) {
        console.error("Failed to find expired trials:", error);
        throw error;
    }

    const userIds = (expiredTrials ?? []).map(
        (s: { user_id: string }) => s.user_id,
    );

    if (userIds.length === 0) {
        return { data: { count: 0 } };
    }

    // Update all expired trials
    for (const userId of userIds) {
        await updateSubscriptionStatus(supabase, userId, "expired");
    }

    return { data: { count: userIds.length } };
};
