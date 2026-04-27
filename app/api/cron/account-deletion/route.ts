import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { validateCronRequest } from "@/lib/cron/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { processExpiredDeletions } from "@/lib/users/service";

/**
 * GET /api/cron/account-deletion
 *
 * Daily cron to hard-delete accounts whose 30-day grace period has expired.
 * Deletes Supabase data first (CASCADE), then Clerk account.
 * Protected by CRON_SECRET.
 */
export const GET = async (req: NextRequest) => {
    const authError = validateCronRequest(req, "account-deletion");
    if (authError) return authError;

    const supabase = createSupabaseAdmin();

    try {
        const result = await processExpiredDeletions(supabase);
        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        console.log("Account deletion cron complete:", result.data);
        return NextResponse.json({
            data: { message: "Complete", ...result.data },
        });
    } catch (err) {
        Sentry.captureException(err);
        console.error("Account deletion cron failed:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
};
