import { type NextRequest, NextResponse } from "next/server";
import { validateCronRequest } from "@/lib/cron/auth";
import { sendTrialEndingEmail } from "@/lib/email/service";
import { getExpiringTrials } from "@/lib/subscriptions/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserTrialEmailContext } from "@/lib/users/service";
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
            const contextResult = await getUserTrialEmailContext(
                supabase,
                trial.user_id,
            );

            if (!contextResult.data) {
                results.failed++;
                continue;
            }

            const {
                email,
                username,
                entriesWritten,
                insightsReceived,
                patternsFound,
            } = contextResult.data;

            const emailResult = await sendTrialEndingEmail(
                email,
                username ?? "",
                DAYS_BEFORE_EXPIRY,
                {
                    entriesWritten,
                    patternsFound,
                    insightsReceived,
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
