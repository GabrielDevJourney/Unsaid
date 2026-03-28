import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { setFeedbackStatus } from "@/lib/feedback/service";
import {
    FeedbackIdSchema,
    FeedbackStatusUpdateSchema,
} from "@/lib/schemas/feedback";
import { createSupabaseServer } from "@/lib/supabase/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/feedback/[id]/status - Update feedback status (admin only)
 */
export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const supabase = await createSupabaseServer();

        // Admin check
        if (!(await isAdmin(userId, supabase))) {
            return NextResponse.json(
                { error: "Forbidden - admin only" },
                { status: 403 },
            );
        }

        const idValidated = FeedbackIdSchema.safeParse(id);
        if (!idValidated.success) {
            return NextResponse.json(
                { error: idValidated.error.message },
                { status: 400 },
            );
        }

        const body = await req.json();
        const validated = FeedbackStatusUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { status } = validated.data;

        const result = await setFeedbackStatus(supabase, id, status);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        console.error("Failed to update feedback status:", error);
        return NextResponse.json(
            { error: "Failed to update feedback status" },
            { status: 500 },
        );
    }
};
