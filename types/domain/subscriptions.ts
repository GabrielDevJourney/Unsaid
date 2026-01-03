import type { Tables, TablesInsert, TablesUpdate } from "../database";

// 1. Database Types (derived from generated types)
export type SubscriptionRow = Tables<"subscriptions">;
export type SubscriptionInsert = TablesInsert<"subscriptions">;
export type SubscriptionUpdate = TablesUpdate<"subscriptions">;

export type PaymentEventRow = Tables<"payment_events">;
export type PaymentEventInsert = TablesInsert<"payment_events">;

// 2. Our Internal Subscription Status
export type SubscriptionStatus = "trial" | "active" | "canceled" | "expired";

// 3. Lemon Squeezy Status Values (from their API)
export type LemonSqueezyStatus =
    | "on_trial"
    | "active"
    | "paused"
    | "past_due"
    | "unpaid"
    | "cancelled"
    | "expired";

// 4. Access Control Types
export interface SubscriptionAccess {
    canUseFeatures: boolean;
    canViewEntries: boolean;
    canExportData: boolean;
    status: SubscriptionStatus;
    trialDaysRemaining: number | null;
    isTrialExpired: boolean;
}

// 5. Lemon Squeezy Webhook Types
export type LemonSqueezyEventType =
    | "subscription_created"
    | "subscription_updated"
    | "subscription_cancelled"
    | "subscription_resumed"
    | "subscription_expired"
    | "subscription_paused"
    | "subscription_unpaused"
    | "subscription_payment_success"
    | "subscription_payment_failed"
    | "subscription_payment_recovered"
    | "subscription_payment_refunded";

export interface LemonSqueezyWebhookMeta {
    event_name: LemonSqueezyEventType;
    custom_data?: {
        user_id?: string;
    };
}

export interface LemonSqueezySubscriptionItem {
    id: number;
    subscription_id: number;
    price_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
}

export interface LemonSqueezyPause {
    mode: "void" | "free";
    resumes_at: string | null;
}

export interface LemonSqueezySubscriptionAttributes {
    store_id: number;
    customer_id: number;
    order_id: number;
    order_item_id: number;
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_name: string;
    user_name: string;
    user_email: string;
    status: LemonSqueezyStatus;
    status_formatted: string;
    card_brand: string | null;
    card_last_four: string | null;
    payment_processor?: string;
    pause: LemonSqueezyPause | null;
    cancelled: boolean;
    trial_ends_at: string | null;
    billing_anchor: number;
    first_subscription_item: LemonSqueezySubscriptionItem | null;
    urls: {
        update_payment_method: string;
        customer_portal?: string;
    };
    renews_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
}

export interface LemonSqueezyWebhookPayload {
    meta: LemonSqueezyWebhookMeta;
    data: {
        type: string;
        id: string;
        attributes: LemonSqueezySubscriptionAttributes;
        relationships?: Record<string, unknown>;
        links?: Record<string, string>;
    };
}
