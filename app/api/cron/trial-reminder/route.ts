import { type NextRequest, NextResponse } from "next/server";
import { sendTrialEndingEmail } from "@/lib/email/service";
import { getExpiringTrials } from "@/lib/subscriptions/repo";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const DAYS_BEFORE_EXPIRY = 3;

/**
 * GET /api/cron/trial-reminder
 *
 * Daily cron to send trial ending reminders.
 * Finds users with trial ending in 3 days and sends batch emails.
 * Protected by CRON_SECRET.
 */
export const GET = async (req: NextRequest) => {
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

    const { data: expiringTrials, error: trialsError } =
        await getExpiringTrials(supabase, DAYS_BEFORE_EXPIRY);

    if (trialsError) {
        console.error("Failed to fetch expiring trials:", trialsError);
        return NextResponse.json(
            { error: "Failed to fetch expiring trials" },
            { status: 500 },
        );
    }

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
                .select("email")
                .eq("user_id", trial.user_id)
                .single();

            if (!user) {
                results.failed++;
                continue;
            }

            const [entriesResult, insightsResult] = await Promise.all([
                supabase
                    .from("entries")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", trial.user_id),
                supabase
                    .from("entry_insights")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", trial.user_id),
            ]);

            const emailResult = await sendTrialEndingEmail(
                user.email,
                user.email.split("@")[0],
                DAYS_BEFORE_EXPIRY,
                {
                    entriesWritten: entriesResult.count ?? 0,
                    insightsReceived: insightsResult.count ?? 0,
                },
            );

            if (emailResult.success) {
                results.sent++;
            } else {
                results.failed++;
                results.errors.push(`${trial.user_id}: ${emailResult.error}`);
            }
        } catch (error) {
            console.error(`Error for ${trial.user_id}:`, error);
            results.failed++;
        }
    }

    console.log("Trial reminders complete:", results);

    return NextResponse.json({ data: { message: "Complete", ...results } });
};
