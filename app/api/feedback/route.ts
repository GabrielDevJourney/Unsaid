import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createFeedback, listFeedback } from "@/lib/feedback/service";
import {
    FeedbackCreateSchema,
    FeedbackListQuerySchema,
} from "@/lib/schemas/feedback";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/feedback - Create new feedback
 */
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
        const validated = FeedbackCreateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { title, description, category } = validated.data;

        const supabase = await createSupabaseServer();
        const result = await createFeedback(
            supabase,
            userId,
            title,
            description,
            category,
        );

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (error) {
        console.error("Failed to create feedback:", error);
        return NextResponse.json(
            { error: "Failed to create feedback" },
            { status: 500 },
        );
    }
};

/**
 * GET /api/feedback - List feedback with pagination and sorting
 */
export const GET = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(req.url);
        const queryInput = {
            page: searchParams.get("page") ?? "1",
            pageSize: searchParams.get("pageSize") ?? "20",
            sort: searchParams.get("sort") ?? "votes",
            status: searchParams.get("status") ?? "all",
        };

        const validated = FeedbackListQuerySchema.safeParse(queryInput);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { page, pageSize, sort, status } = validated.data;

        const supabase = await createSupabaseServer();
        const result = await listFeedback(
            supabase,
            userId,
            page,
            pageSize,
            sort,
            status,
        );

        return NextResponse.json({
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("Failed to list feedback:", error);
        return NextResponse.json(
            { error: "Failed to list feedback" },
            { status: 500 },
        );
    }
};
