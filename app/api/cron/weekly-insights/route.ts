import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
    createWeeklyInsight,
    getWeekRange,
    getWeekStart,
} from "@/lib/weekly-insights/service";
import { isServiceError } from "@/types";

/**
 * GET /api/cron/weekly-insights
 *
 * Cron job to generate weekly insights for all users with entries.
 * Runs weekly (configured in vercel.json or cron service).
 * Protected by CRON_SECRET.
 *
 * Flow:
 * 1. Verify authorization
 * 2. Get last week's date range
 * 3. Find users with entries in that range
 * 4. Generate weekly insight for each user
 * 5. Return summary
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

    const supabase = createSupabaseAdmin();

    // Get last week's date range (Monday to Sunday of previous week)
    const today = new Date();
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const weekStart = getWeekStart(lastWeekDate);
    const { start, end } = getWeekRange(weekStart);

    console.log(`Processing weekly insights for week: ${weekStart}`);

    // Get all entries from last week grouped by user
    const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select("id, user_id, content, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

    if (entriesError) {
        console.error("Failed to fetch entries:", entriesError);
        return NextResponse.json(
            { error: "Failed to fetch entries" },
            { status: 500 },
        );
    }

    if (!entries || entries.length === 0) {
        return NextResponse.json({
            data: {
                message: "No entries found for last week",
                weekStart,
                processed: 0,
            },
        });
    }

    // Group entries by user
    const entriesByUser = entries.reduce(
        (acc, entry) => {
            if (!acc[entry.user_id]) {
                acc[entry.user_id] = [];
            }
            acc[entry.user_id].push(entry);
            return acc;
        },
        {} as Record<
            string,
            Array<{
                id: string;
                user_id: string;
                content: string;
                created_at: string;
            }>
        >,
    );

    const results = {
        processed: 0,
        success: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[],
    };

    // Process each user - continue on failure to avoid blocking others
    for (const [userId, userEntries] of Object.entries(entriesByUser)) {
        results.processed++;

        // Skip if less than 2 entries
        if (userEntries.length < 2) {
            results.skipped++;
            continue;
        }

        try {
            const result = await createWeeklyInsight(userId, {
                weekStart,
                entryIds: userEntries.map((e) => e.id),
                entries: userEntries.map((e) => ({
                    id: e.id,
                    content: e.content,
                    createdAt: e.created_at,
                })),
            });

            if (isServiceError(result)) {
                results.failed++;
                results.errors.push(`User ${userId}: ${result.error}`);
            } else {
                results.success++;
            }
        } catch (error) {
            // Unexpected error - log and continue to next user
            console.error(`Unexpected error for user ${userId}:`, error);
            results.failed++;
            results.errors.push(`User ${userId}: Unexpected error`);
        }
    }

    console.log("Weekly insights generation complete:", results);

    return NextResponse.json({
        data: {
            message: "Weekly insights generation complete",
            weekStart,
            ...results,
        },
    });
};
