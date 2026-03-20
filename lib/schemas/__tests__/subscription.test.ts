import { describe, expect, it } from "vitest";
import { LemonWebhookSchema } from "../subscription";

const basePayload = {
    meta: {
        event_name: "subscription_created",
        custom_data: { user_id: "user_abc" },
    },
    data: {
        type: "subscriptions",
        id: "sub-123",
        attributes: {
            customer_id: 999,
            user_email: "test@example.com",
            status: "active",
            cancelled: false,
            trial_ends_at: null,
            renews_at: "2026-04-17T10:00:00.000Z",
            ends_at: null,
            variant_id: 456,
            variant_name: "Monthly",
            urls: {
                update_payment_method: "https://lemonsqueezy.com/billing",
                customer_portal: "https://lemonsqueezy.com/portal",
            },
        },
    },
};

describe("LemonWebhookSchema", () => {
    it("accepts a valid payload", () => {
        const result = LemonWebhookSchema.safeParse(basePayload);
        expect(result.success).toBe(true);
    });

    it("passes through extra fields LS sends without failing", () => {
        const payload = {
            ...basePayload,
            data: {
                ...basePayload.data,
                attributes: {
                    ...basePayload.data.attributes,
                    product_id: 789,
                    product_name: "Unsaid",
                    store_id: 1,
                    order_id: 42,
                    unknown_future_field: "should not break",
                },
            },
        };

        const result = LemonWebhookSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it("captures variant_name when present", () => {
        const result = LemonWebhookSchema.safeParse(basePayload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.data.attributes.variant_name).toBe("Monthly");
        }
    });

    it("rejects payload with missing required fields", () => {
        const { user_email: _, ...withoutEmail } = basePayload.data.attributes;
        const payload = {
            ...basePayload,
            data: { ...basePayload.data, attributes: withoutEmail },
        };

        const result = LemonWebhookSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });
});
