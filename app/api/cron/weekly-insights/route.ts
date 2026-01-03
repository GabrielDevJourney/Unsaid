import { type NextRequest, NextResponse } from "next/server";
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
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET not configured");
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 },
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        console.error("Weekly insights cron failed:", error);
        return NextResponse.json(
            { error: "Failed to process weekly insights" },
            { status: 500 },
        );
    }
};
