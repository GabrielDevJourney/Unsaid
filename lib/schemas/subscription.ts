import { z } from "zod";

// Internal subscription status
export const SubscriptionStatus = z.enum([
    "trial",
    "active",
    "canceled",
    "expired",
]);
export type SubscriptionStatusType = z.infer<typeof SubscriptionStatus>;

// Lemon Squeezy status values
export const LemonStatus = z.enum([
    "on_trial",
    "active",
    "paused",
    "past_due",
    "unpaid",
    "cancelled",
    "expired",
]);
export type LemonStatusType = z.infer<typeof LemonStatus>;

// Lemon Squeezy subscription events we handle
export const LemonEventType = z.enum([
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_resumed",
    "subscription_expired",
    "subscription_paused",
    "subscription_unpaused",
]);
export type LemonEventTypeValue = z.infer<typeof LemonEventType>;

// Webhook payload schema
export const LemonWebhookSchema = z.object({
    meta: z.object({
        event_name: z.string(),
        custom_data: z
            .object({
                user_id: z.string().optional(),
            })
            .optional(),
    }),
    data: z.object({
        type: z.string(),
        id: z.string(),
        attributes: z
            .object({
                customer_id: z.number(),
                user_email: z.string().email(),
                status: LemonStatus,
                cancelled: z.boolean(),
                trial_ends_at: z.string().nullable(),
                renews_at: z.string().nullable(),
                ends_at: z.string().nullable(),
                urls: z.object({
                    update_payment_method: z.string(),
                    customer_portal: z.string().optional(),
                }),
            })
            .passthrough(),
    }),
});

export type LemonWebhookInput = z.infer<typeof LemonWebhookSchema>;

// Check if event is a subscription event we handle
export const isSubscriptionEvent = (eventType: string): boolean => {
    return LemonEventType.safeParse(eventType).success;
};

// Map Lemon status to our internal status
export const mapLemonToInternalStatus = (
    lemonStatus: LemonStatusType,
    cancelled: boolean,
): SubscriptionStatusType => {
    if (cancelled) return "canceled";

    switch (lemonStatus) {
        case "on_trial":
            return "trial";
        case "active":
        case "paused":
        case "past_due":
        case "unpaid":
            return "active";
        case "cancelled":
            return "canceled";
        case "expired":
            return "expired";
    }
};
