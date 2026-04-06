import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import { generateEntryInsight } from "@/lib/entry-insights/service";
import { EntryInsightGenerateSchema } from "@/lib/schemas/entry-insight";

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
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const result = await generateEntryInsight(
            userId,
            validated.data.entry_id,
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
