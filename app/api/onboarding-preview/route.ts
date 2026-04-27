import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { generateOnboardingPreview } from "@/lib/onboarding/service";
import { onboardingPreviewRequestSchema } from "@/lib/schemas/onboarding-preview";
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
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServer();
        const result = await generateOnboardingPreview(
            supabase,
            userId,
            validated.data,
        );

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
