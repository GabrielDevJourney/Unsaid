import crypto from "node:crypto";
import { LemonWebhookSchema } from "@/lib/schemas/subscription";
import { processWebhookEvent } from "@/lib/subscriptions/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Verify Lemon Squeezy webhook signature using HMAC SHA256.
 */
const verifySignature = (
    rawBody: string,
    signature: string | null,
): boolean => {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
        console.error("Missing LEMONSQUEEZY_WEBHOOK_SECRET");
        return false;
    }

    if (!signature) {
        return false;
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(digest, signatureBuffer);
};

/**
 * Generate unique webhook ID from payload for idempotency.
 */
const generateWebhookId = (
    eventName: string,
    subscriptionId: string,
): string => {
    const timestamp = Date.now();
    return `${eventName}_${subscriptionId}_${timestamp}`;
};

export const POST = async (req: Request) => {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("X-Signature");

        // Verify signature
        if (!verifySignature(rawBody, signature)) {
            console.error("Invalid webhook signature");
            return new Response("Invalid signature", { status: 400 });
        }

        // Parse payload
        const rawPayload = JSON.parse(rawBody);
        const validated = LemonWebhookSchema.safeParse(rawPayload);

        if (!validated.success) {
            console.error("Invalid webhook payload:", validated.error.issues);
            return new Response("Invalid payload", { status: 400 });
        }

        const payload = validated.data;
        const webhookId = generateWebhookId(
            payload.meta.event_name,
            payload.data.id,
        );

        // Process webhook with admin client (bypasses RLS)
        const supabase = createSupabaseAdmin();
        const result = await processWebhookEvent(supabase, webhookId, payload);

        if ("error" in result) {
            console.error("Webhook processing error:", result.error);
            // Return 200 to prevent retries for expected errors (user not found)
            return new Response("Processed with warning", { status: 200 });
        }

        const status = result.data.processed
            ? "processed"
            : "already processed";
        return new Response(`Webhook ${status}`, { status: 200 });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return new Response("Internal error", { status: 500 });
    }
};
