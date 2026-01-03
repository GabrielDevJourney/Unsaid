import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Generate Lemon Squeezy checkout URL with user tracking.
 *
 * The checkout URL includes custom_data[user_id] so webhooks
 * can link the subscription back to our user.
 */
export const POST = async () => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
        const storeUrl = process.env.LEMONSQUEEZY_STORE_URL;

        if (!variantId || !storeUrl) {
            console.error("Missing Lemon Squeezy configuration");
            return NextResponse.json(
                { error: "Payment not configured" },
                { status: 500 },
            );
        }

        // Build checkout URL with custom data for webhook linking
        const checkoutUrl = new URL(`${storeUrl}/checkout/buy/${variantId}`);
        checkoutUrl.searchParams.set("checkout[custom][user_id]", userId);

        return NextResponse.json({ data: { url: checkoutUrl.toString() } });
    } catch (error) {
        console.error("Checkout URL generation failed:", error);
        return NextResponse.json(
            { error: "Failed to generate checkout URL" },
            { status: 500 },
        );
    }
};
