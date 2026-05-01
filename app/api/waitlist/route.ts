import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { sendWaitlistConfirmationEmail } from "@/lib/email/service";
import { RATE_LIMIT_ERROR } from "@/lib/rate-limits/service";
import { WaitlistCreateSchema } from "@/lib/schemas/waitlist";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { addToWaitlist } from "@/lib/waitlist/service";
import { isServiceError } from "@/types";

/**
 * POST /api/waitlist - Add email to waitlist
 *
 * Public endpoint (no auth required) for landing page signup.
 */
export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        const validated = WaitlistCreateSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, source } = validated.data;
        const ipAddress =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        const supabase = createSupabaseAdmin();
        const result = await addToWaitlist(supabase, email, source, ipAddress);

        if (isServiceError(result)) {
            if (result.error === RATE_LIMIT_ERROR) {
                return NextResponse.json(
                    { error: "Too many requests. Please try again later." },
                    { status: 429 },
                );
            }
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        if (result.data && !result.data.isExisting) {
            const position = result.data.position;

            if (position !== null) {
                sendWaitlistConfirmationEmail(email, position).catch(
                    (emailError) => {
                        console.error(
                            "Failed to send waitlist confirmation email:",
                            emailError,
                        );
                    },
                );
            }
        }

        return NextResponse.json({
            data: { message: result.data?.message },
        });
    } catch (error) {
        Sentry.captureException(error);
        console.error("Waitlist endpoint error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 },
        );
    }
};
