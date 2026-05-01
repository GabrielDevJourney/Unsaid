import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { validateCronRequest } from "@/lib/cron/auth";
import { processWeeklyInsightsForAllUsers } from "@/lib/weekly-insights/service";
import { isServiceError } from "@/types";

/**
 * GET /api/cron/weekly-insights
 *
 * Cron job to generate weekly insights for all users with entries.
 * Runs weekly (configured in vercel.json).
 * Protected by CRON_SECRET.
 */
export const GET = async (req: NextRequest) => {
    const authError = validateCronRequest(req, "weekly-insights");
    if (authError) return authError;

    try {
        const result = await processWeeklyInsightsForAllUsers();

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        console.log("Weekly insights generation complete:", result.data);

        return NextResponse.json({
            data: {
                message:
                    result.data.processed === 0
                        ? "No entries found for last week"
                        : "Weekly insights generation complete",
                ...result.data,
            },
        });
    } catch (error) {
        Sentry.captureException(error);
        console.error("Weekly insights cron failed:", error);
        return NextResponse.json(
            { error: "Failed to process weekly insights" },
            { status: 500 },
        );
    }
};
