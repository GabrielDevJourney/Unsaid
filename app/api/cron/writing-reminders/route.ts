import { type NextRequest, NextResponse } from "next/server";
import { validateCronRequest } from "@/lib/cron/auth";
import { sendWritingReminderEmail } from "@/lib/email/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
    getUsersOptedIntoWritingReminders,
    updateLastWritingReminderSent,
} from "@/lib/users/service";

const INACTIVITY_DAYS = 3;
const COOLDOWN_DAYS = 7;

/**
 * GET /api/cron/writing-reminders
 *
 * Daily cron to send writing reminders to inactive users.
 * Targets users with notify_writing_reminders=true, active/trial subscription,
 * no entry in the last 3 days, and cooldown of 7 days between reminders.
 * Protected by CRON_SECRET.
 */
export const GET = async (req: NextRequest) => {
    const authError = validateCronRequest(req, "writing-reminders");
    if (authError) return authError;

    const supabase = createSupabaseAdmin();

    const { data: users, error: usersError } =
        await getUsersOptedIntoWritingReminders(supabase, COOLDOWN_DAYS);

    if (usersError) {
        console.error("Failed to fetch writing reminder users:", usersError);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 },
        );
    }

    if (!users || users.length === 0) {
        return NextResponse.json({
            data: { message: "No eligible users", processed: 0 },
        });
    }

    const inactivityCutoff = new Date();
    inactivityCutoff.setDate(inactivityCutoff.getDate() - INACTIVITY_DAYS);

    const results = {
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[],
    };

    for (const user of users) {
        results.processed++;

        try {
            const { data: latestEntry } = await supabase
                .from("entries")
                .select("created_at")
                .eq("user_id", user.user_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            // Skip if user wrote recently
            if (
                latestEntry &&
                new Date(latestEntry.created_at) > inactivityCutoff
            ) {
                results.skipped++;
                continue;
            }

            const daysSinceLastEntry = latestEntry
                ? Math.floor(
                      (Date.now() -
                          new Date(latestEntry.created_at).getTime()) /
                          (1000 * 60 * 60 * 24),
                  )
                : null;

            const emailResult = await sendWritingReminderEmail(
                user.email,
                user.username,
                daysSinceLastEntry,
            );

            if (emailResult.success) {
                await updateLastWritingReminderSent(supabase, user.user_id);
                results.sent++;
            } else {
                results.failed++;
                results.errors.push("Failed to send writing reminder email");
            }
        } catch (error) {
            console.error(`Error for ${user.user_id}:`, error);
            results.failed++;
        }
    }

    console.log("Writing reminders complete:", results);

    return NextResponse.json({ data: { message: "Complete", ...results } });
};
