import { NextResponse } from "next/server";
import { sendWaitlistConfirmationEmail } from "@/lib/email/service";
import { WaitlistCreateSchema } from "@/lib/schemas/waitlist";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { addToWaitlist } from "@/lib/waitlist/service";

/**
 * POST /api/waitlist - Add email to waitlist
 *
 * Public endpoint (no auth required) for landing page signup.
 */
export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        // Validate input
        const validated = WaitlistCreateSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, source } = validated.data;

        const supabase = createSupabaseAdmin();
        const result = await addToWaitlist(supabase, email, source);

        if (result.data && !result.data.isExisting) {
            sendWaitlistConfirmationEmail(email).catch((emailError) => {
                console.error(
                    "Failed to send waitlist confirmation email:",
                    emailError,
                );
            });
        }

        return NextResponse.json({
            data: { message: result.data?.message },
        });
    } catch (error) {
        console.error("Waitlist endpoint error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 },
        );
    }
};
