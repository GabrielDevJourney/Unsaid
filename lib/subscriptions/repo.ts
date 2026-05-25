import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionStatusType } from "@/lib/schemas/subscription";
import type { Json } from "@/types/database";

export const createSubscription = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase
        .from("subscriptions")
        .insert({
            user_id: userId,
            status: "trial",
        })
        .select()
        .single();
};

export const findSubscriptionByUserId = async (
    supabase: SupabaseClient,
    userId: string,
) => {
    return supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();
};

export const findSubscriptionByLemonId = async (
    supabase: SupabaseClient,
    lemonSubscriptionId: string,
) => {
    return supabase
        .from("subscriptions")
        .select("*")
        .eq("lemon_subscription_id", lemonSubscriptionId)
        .single();
};

export const findUserByEmail = async (
    supabase: SupabaseClient,
    email: string,
) => {
    return supabase.from("users").select("user_id").eq("email", email).single();
};

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

export const updateSubscriptionFromWebhook = async (
    supabase: SupabaseClient,
    userId: string,
    data: {
        status: SubscriptionStatusType;
        lemonSubscriptionId?: string;
        lemonCustomerId?: string;
        planId?: string;
        planName?: string;
        priceInCents?: number;
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
            plan_id: data.planId,
            plan_name: data.planName,
            price_in_cents: data.priceInCents,
            current_period_end: data.currentPeriodEnd,
            canceled_at: data.canceledAt,
            customer_portal_url: data.customerPortalUrl,
        })
        .eq("user_id", userId)
        .select()
        .single();
};

export const createPaymentEvent = async (
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

export const findPaymentEventByLemonId = async (
    supabase: SupabaseClient,
    lemonEventId: string,
) => {
    return supabase
        .from("payment_events")
        .select("id")
        .eq("lemon_event_id", lemonEventId)
        .maybeSingle();
};
