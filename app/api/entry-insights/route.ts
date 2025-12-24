import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
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

        const result = await generateEntryInsight(userId, {
            entryId: validated.data.entry_id,
            content: validated.data.content,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Entry insight generation failed", error);
        return NextResponse.json(
            { error: "Failed to craft insight" },
            { status: 500 },
        );
    }
};
