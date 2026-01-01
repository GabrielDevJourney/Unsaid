import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { toggleVote } from "@/lib/feedback/service";
import { FeedbackIdSchema } from "@/lib/schemas/feedback";
import { createSupabaseServer } from "@/lib/supabase/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/feedback/[id]/vote - Toggle vote on feedback
 *
 * If user has voted, removes vote. If not voted, adds vote.
 * Idempotent - calling multiple times is safe.
 */
export const POST = async (_req: NextRequest, { params }: RouteParams) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const validated = FeedbackIdSchema.safeParse(id);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.message },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServer();
        const result = await toggleVote(supabase, userId, id);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        console.error("Failed to toggle vote:", error);
        return NextResponse.json(
            { error: "Failed to toggle vote" },
            { status: 500 },
        );
    }
};
