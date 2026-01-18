import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWaitlistConfirmationEmail } from "@/lib/email/service";

const WaitlistSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    source: z.string().optional().default("landing_page"),
});

/**
 * Create a Supabase client with anon key for public waitlist signup.
 * RLS policy allows anon INSERT on waitlist table.
 */
const createAnonClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabasePublishableKey);
};

/**
 * POST /api/waitlist - Add email to waitlist
 *
 * Public endpoint (no auth required) for landing page signup.
 */
export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        // Validate input
        const validated = WaitlistSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, source } = validated.data;

        // Insert into waitlist
        const supabase = createAnonClient();
        const { error } = await supabase.from("waitlist").insert({
            email: email.toLowerCase().trim(),
            source,
        });

        // Handle duplicate email (unique constraint violation)
        if (error?.code === "23505") {
            return NextResponse.json({
                data: { message: "You're already on the waitlist!" },
            });
        }

        if (error) {
            console.error("Waitlist signup error:", error);
            return NextResponse.json(
                { error: "Failed to join waitlist. Please try again." },
                { status: 500 },
            );
        }

        // Send confirmation email (non-blocking)
        const normalizedEmail = email.toLowerCase().trim();
        sendWaitlistConfirmationEmail(normalizedEmail).catch((emailError) => {
            console.error(
                "Failed to send waitlist confirmation email:",
                emailError,
            );
        });

        return NextResponse.json({
            data: { message: "You're on the list! We'll be in touch soon." },
        });
    } catch (error) {
        console.error("Waitlist endpoint error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 },
        );
    }
};
