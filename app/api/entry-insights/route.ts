import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { generateEntryInsight } from "@/lib/entry-insights/service";
import {
    consumeRateLimit,
    RATE_LIMIT_ERROR,
    RATE_LIMIT_SCOPES,
} from "@/lib/rate-limits/service";
import { EntryInsightGenerateSchema } from "@/lib/schemas/entry-insight";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

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
        const validated = EntryInsightGenerateSchema.safeParse(body);

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
            RATE_LIMIT_SCOPES.entryInsight,
            userId,
            60 * 1000,
            5,
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

        const result = await generateEntryInsight(
            userId,
            validated.data.entry_id,
            validated.data.reflection_context,
        );

        if (!result) {
            return NextResponse.json(
                { error: `Insight limit reached (max ${MAX_INSIGHT_COUNT})` },
                { status: 429 },
            );
        }

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Entry insight generation failed", error);
        return NextResponse.json(
            { error: "Failed to craft insight" },
            { status: 500 },
        );
    }
};
