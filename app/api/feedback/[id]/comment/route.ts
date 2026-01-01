import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createComment } from "@/lib/feedback/service";
import {
    FeedbackCommentSchema,
    FeedbackIdSchema,
} from "@/lib/schemas/feedback";
import { createSupabaseServer } from "@/lib/supabase/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/feedback/[id]/comment - Add comment to feedback
 */
export const POST = async (req: NextRequest, { params }: RouteParams) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const idValidated = FeedbackIdSchema.safeParse(id);
        if (!idValidated.success) {
            return NextResponse.json(
                { error: idValidated.error.message },
                { status: 400 },
            );
        }

        const body = await req.json();
        const validated = FeedbackCommentSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { description } = validated.data;

        const supabase = await createSupabaseServer();
        const result = await createComment(supabase, userId, id, description);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (error) {
        console.error("Failed to create comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 },
        );
    }
};
