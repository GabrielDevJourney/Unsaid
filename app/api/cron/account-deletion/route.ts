import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
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
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET not configured");
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 },
        );
    }

    const expectedHeader = `Bearer ${cronSecret}`;
    const isValid =
        authHeader !== null &&
        authHeader.length === expectedHeader.length &&
        crypto.timingSafeEqual(
            Buffer.from(authHeader, "utf8"),
            Buffer.from(expectedHeader, "utf8"),
        );

    if (!isValid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        console.error("Account deletion cron failed:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
};
