import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { sendAllReviewEmails, sendReviewEmail } from "@/lib/email/review";
import { EmailReviewRequestSchema } from "@/lib/schemas/email-review";
import { createSupabaseServer } from "@/lib/supabase/server";

export const POST = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const supabase = await createSupabaseServer();
        if (!(await isAdmin(userId, supabase))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const validated = EmailReviewRequestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error:
                        validated.error.issues[0]?.message ?? "Invalid input",
                },
                { status: 400 },
            );
        }

        const { email, template, preset } = validated.data;

        if (template === "all") {
            const results = await sendAllReviewEmails(email);

            return NextResponse.json({
                data: {
                    sent: results.filter((result) => result.success).length,
                    failed: results.filter((result) => !result.success).length,
                    results,
                },
            });
        }

        const result = await sendReviewEmail({
            to: email,
            template,
            preset,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error ?? "Failed to send review email" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            data: {
                sent: 1,
                failed: 0,
                results: [{ template, ...result }],
            },
        });
    } catch (error) {
        console.error("Admin email review failed:", error);
        return NextResponse.json(
            { error: "Failed to send review email" },
            { status: 500 },
        );
    }
};
