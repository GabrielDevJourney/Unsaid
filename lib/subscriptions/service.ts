import type { SupabaseClient } from "@supabase/supabase-js";
import { TRIAL_DAYS } from "@/lib/constants";
import {
    isSubscriptionEvent,
    type LemonWebhookInput,
    mapLemonToInternalStatus,
} from "@/lib/schemas/subscription";
import { updateUserSubscriptionStatus } from "@/lib/users/repo";
import type { ServiceResult } from "@/types";
import type { Json } from "@/types/database";
import type { SubscriptionRow } from "@/types/domain/subscriptions";
import {
    createPaymentEvent,
    createSubscription,
    findExpiringTrials,
    findPaymentEventByLemonId,
    findSubscriptionByUserId,
    findUserByEmail,
    updateSubscriptionFromWebhook,
    updateSubscriptionStatus,
} from "./repo";

/** Maps LS variant_name to price in cents. */
const PLAN_PRICE_MAP: Record<string, number> = {
    Monthly: 1099,
    Yearly: 9900,
};

export const createTrialSubscription = async (
    supabase: SupabaseClient,
    userId: string,
    trialDays: number = TRIAL_DAYS,
): Promise<ServiceResult<SubscriptionRow>> => {
    const { data, error } = await createSubscription(
        supabase,
        userId,
        trialDays,
    );

    // Handle duplicate (idempotent for webhook retries)
    if (error?.code === "23505") {
        const { data: existing } = await findSubscriptionByUserId(
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

    if (!data) throw new Error("createSubscription returned no data");
    return { data };
};

export const getSubscription = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<SubscriptionRow>> => {
    const { data, error } = await findSubscriptionByUserId(supabase, userId);

    if (error?.code === "PGRST116") {
        return { error: "Subscription not found" };
    }

    if (error) {
        console.error("Failed to get subscription:", error);
        throw error;
    }

    if (!data) throw new Error("findSubscriptionByUserId returned no data");
    return { data };
};

export const processWebhookEvent = async (
    supabase: SupabaseClient,
    webhookId: string,
    payload: LemonWebhookInput,
): Promise<ServiceResult<{ processed: boolean }>> => {
    const eventType = payload.meta.event_name;

    const { data: existingEvent } = await findPaymentEventByLemonId(
        supabase,
        webhookId,
    );

    if (existingEvent) {
        return { data: { processed: false } };
    }

    if (!isSubscriptionEvent(eventType)) {
        await createPaymentEvent(supabase, {
            eventType,
            lemonEventId: webhookId,
            payload: payload as unknown as Json,
        });
        return { data: { processed: true } };
    }

    const userEmail = payload.data.attributes.user_email;
    const { data: user, error: userError } = await findUserByEmail(
        supabase,
        userEmail,
    );

    if (userError || !user) {
        const customUserId = payload.meta.custom_data?.user_id;
        if (!customUserId) {
            console.error("User not found for webhook:", userEmail);
            return { error: `User not found: ${userEmail}` };
        }
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

const processSubscriptionUpdate = async (
    supabase: SupabaseClient,
    userId: string,
    webhookId: string,
    eventType: string,
    payload: LemonWebhookInput,
): Promise<ServiceResult<{ processed: boolean }>> => {
    const attrs = payload.data.attributes;
    const lemonSubscriptionId = payload.data.id;

    const internalStatus = mapLemonToInternalStatus(
        attrs.status,
        attrs.cancelled,
    );

    const planName = attrs.variant_name;
    const priceInCents = planName ? PLAN_PRICE_MAP[planName] : undefined;

    const { error: updateError } = await updateSubscriptionFromWebhook(
        supabase,
        userId,
        {
            status: internalStatus,
            lemonSubscriptionId: lemonSubscriptionId,
            lemonCustomerId: String(attrs.customer_id),
            planId: attrs.variant_id ? String(attrs.variant_id) : undefined,
            planName,
            priceInCents,
            currentPeriodEnd: attrs.renews_at ?? attrs.ends_at ?? undefined,
            canceledAt: attrs.cancelled ? new Date().toISOString() : null,
            customerPortalUrl: attrs.urls.customer_portal,
        },
    );

    if (updateError) {
        console.error("Failed to update subscription:", updateError);
        throw updateError;
    }

    await updateUserSubscriptionStatus(supabase, userId, internalStatus);

    await createPaymentEvent(supabase, {
        userId,
        eventType,
        lemonEventId: webhookId,
        payload: payload as unknown as Json,
    });

    return { data: { processed: true } };
};

export const cancelLemonSubscription = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<null>> => {
    const { data: sub } = await findSubscriptionByUserId(supabase, userId);

    if (!sub?.lemon_subscription_id) {
        return { data: null };
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
        throw new Error("LEMONSQUEEZY_API_KEY is not set");
    }

    const response = await fetch(
        `https://api.lemonsqueezy.com/v1/subscriptions/${sub.lemon_subscription_id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/vnd.api+json",
            },
        },
    );

    // 200: cancelled successfully; 404/422: already gone — treat as success
    if (!response.ok && response.status !== 404 && response.status !== 422) {
        const body = await response.text();
        console.error(
            `LS cancel failed for user ${userId}: ${response.status} ${body}`,
        );
        return { error: `LS cancellation failed: ${response.status}` };
    }

    return { data: null };
};

export const getExpiringTrials = async (
    supabase: SupabaseClient,
    daysUntilExpiry: number,
): Promise<
    ServiceResult<{ user_id: string; trial_ends_at: string | null }[]>
> => {
    const { data, error } = await findExpiringTrials(supabase, daysUntilExpiry);

    if (error) {
        console.error("Failed to fetch expiring trials:", error);
        return { error: "Failed to fetch expiring trials" };
    }

    return { data: data ?? [] };
};

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

    for (const userId of userIds) {
        await updateSubscriptionStatus(supabase, userId, "expired");
        await updateUserSubscriptionStatus(supabase, userId, "expired");
    }

    return { data: { count: userIds.length } };
};
