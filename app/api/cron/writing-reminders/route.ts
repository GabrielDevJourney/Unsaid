import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
    getUsersOptedIntoWritingReminders,
    updateLastWritingReminderSent,
} from "@/lib/users/repo";

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

            const _daysSinceLastEntry = latestEntry
                ? Math.floor(
                      (Date.now() -
                          new Date(latestEntry.created_at).getTime()) /
                          (1000 * 60 * 60 * 24),
                  )
                : null;

            // TODO(UNS-272): wire up sendWritingReminderEmail once the
            // writing-reminder email template is implemented.
            await updateLastWritingReminderSent(supabase, user.user_id);
            results.sent++;
        } catch (error) {
            console.error(`Error for ${user.user_id}:`, error);
            results.failed++;
        }
    }

    console.log("Writing reminders complete:", results);

    return NextResponse.json({ data: { message: "Complete", ...results } });
};
