import { type NextRequest, NextResponse } from "next/server";
import { validateCronRequest } from "@/lib/cron/auth";
import { sendTrialEndingEmail } from "@/lib/email/service";
import { getExpiringTrials } from "@/lib/subscriptions/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isServiceError } from "@/types";

const DAYS_BEFORE_EXPIRY = 3;

/**
 * GET /api/cron/trial-reminder
 *
 * Daily cron to send trial ending reminders.
 * Finds users with trial ending in 3 days and sends batch emails.
 * Protected by CRON_SECRET.
 */
export const GET = async (req: NextRequest) => {
    const authError = validateCronRequest(req, "trial-reminder");
    if (authError) return authError;

    const supabase = createSupabaseAdmin();

    const trialsResult = await getExpiringTrials(supabase, DAYS_BEFORE_EXPIRY);

    if (isServiceError(trialsResult)) {
        return NextResponse.json(
            { error: trialsResult.error },
            { status: 500 },
        );
    }

    const expiringTrials = trialsResult.data;

    if (!expiringTrials || expiringTrials.length === 0) {
        return NextResponse.json({
            data: { message: "No trials expiring soon", processed: 0 },
        });
    }

    const results = {
        processed: 0,
        sent: 0,
        failed: 0,
        errors: [] as string[],
    };

    for (const trial of expiringTrials) {
        results.processed++;

        try {
            const { data: user } = await supabase
                .from("users")
                .select("email, username")
                .eq("user_id", trial.user_id)
                .single();

            if (!user) {
                results.failed++;
                continue;
            }

            const [entriesResult, insightsResult, weeklyInsightsResult] =
                await Promise.all([
                    supabase
                        .from("entries")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", trial.user_id),
                    supabase
                        .from("entry_insights")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", trial.user_id),
                    supabase
                        .from("weekly_insights")
                        .select("id")
                        .eq("user_id", trial.user_id),
                ]);

            const weeklyInsightIds =
                weeklyInsightsResult.data?.map((insight) => insight.id) ?? [];

            let patternsFound = 0;

            if (weeklyInsightIds.length > 0) {
                const patternsResult = await supabase
                    .from("weekly_insight_patterns")
                    .select("id", { count: "exact", head: true })
                    .in("weekly_insight_id", weeklyInsightIds);

                patternsFound = patternsResult.count ?? 0;
            }

            const emailResult = await sendTrialEndingEmail(
                user.email,
                user.username,
                DAYS_BEFORE_EXPIRY,
                {
                    entriesWritten: entriesResult.count ?? 0,
                    patternsFound,
                    insightsReceived: insightsResult.count ?? 0,
                },
            );

            if (emailResult.success) {
                results.sent++;
            } else {
                results.failed++;
                results.errors.push("Failed to send trial reminder email");
            }
        } catch (error) {
            console.error(`Error for ${trial.user_id}:`, error);
            results.failed++;
        }
    }

    console.log("Trial reminders complete:", results);

    return NextResponse.json({ data: { message: "Complete", ...results } });
};
