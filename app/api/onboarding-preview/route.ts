import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import {
    generateOnboardingPreview,
    getEntryForOnboardingPreview,
} from "@/lib/onboarding/service";
import {
    consumeRateLimit,
    RATE_LIMIT_ERROR,
    RATE_LIMIT_SCOPES,
} from "@/lib/rate-limits/service";
import { onboardingPreviewRequestSchema } from "@/lib/schemas/onboarding-preview";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isServiceError } from "@/types";

export const POST = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const validated = onboardingPreviewRequestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error:
                        validated.error.issues[0]?.message ?? "Invalid request",
                },
                { status: 400 },
            );
        }

        const adminSupabase = createSupabaseAdmin();
        const rateLimit = await consumeRateLimit(
            adminSupabase,
            RATE_LIMIT_SCOPES.onboardingPreview,
            userId,
            60 * 60 * 1000,
            3,
        );

        if (rateLimit.error === RATE_LIMIT_ERROR) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 },
            );
        }
        if (rateLimit.error) {
            return NextResponse.json(
                { error: "Service unavailable" },
                { status: 503 },
            );
        }

        // Re-fetch entry + insight server-side to prevent prompt injection via
        // client-supplied content/insight fields.
        const supabase = await createSupabaseServer();
        const entryResult = await getEntryForOnboardingPreview(
            supabase,
            validated.data.entry_id,
        );

        if (entryResult.error || !entryResult.data) {
            return NextResponse.json(
                { error: "Entry insight not found" },
                { status: 404 },
            );
        }

        const { content, insight } = entryResult.data;

        const result = await generateOnboardingPreview(supabase, userId, {
            entry_id: validated.data.entry_id,
            content,
            insight: insight.content,
            tags: insight.tags,
        });

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        Sentry.captureException(error);
        console.error("Onboarding preview generation failed", error);
        return NextResponse.json(
            { error: "Failed to generate preview" },
            { status: 500 },
        );
    }
};
