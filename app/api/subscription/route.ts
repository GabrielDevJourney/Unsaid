import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscription } from "@/lib/subscriptions/service";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAccessStatus } from "@/lib/trial/service";
import { isServiceError } from "@/types";
import type { SubscriptionRow } from "@/types/domain/subscriptions";

/**
 * GET /api/subscription - Get current user's subscription status
 */
export const GET = async () => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const supabase = await createSupabaseServer();
        const result = await getSubscription(supabase, userId);

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        const subscription = result.data as SubscriptionRow;
        const accessStatus = getAccessStatus(subscription);

        return NextResponse.json({
            data: {
                status: subscription.status,
                trialEndsAt: subscription.trial_ends_at,
                currentPeriodEnd: subscription.current_period_end,
                canceledAt: subscription.canceled_at,
                access: accessStatus,
            },
        });
    } catch (error) {
        console.error("Failed to fetch subscription:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 },
        );
    }
};
