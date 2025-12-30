import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProgressInsightsPaginated } from "@/lib/progress-insights/repo";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const QuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * GET /api/insights/progress
 *
 * Get paginated progress insights for the authenticated user.
 * Returns insights ordered by creation date (newest first).
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

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const queryResult = QuerySchema.safeParse({
            page: searchParams.get("page") ?? 1,
            pageSize: searchParams.get("pageSize") ?? 10,
        });

        if (!queryResult.success) {
            return NextResponse.json(
                { error: queryResult.error.issues },
                { status: 400 },
            );
        }

        const { page, pageSize } = queryResult.data;
        const supabase = createSupabaseAdmin();

        const {
            data: insights,
            count,
            error,
        } = await getProgressInsightsPaginated(
            supabase,
            userId,
            page,
            pageSize,
        );

        if (error) {
            console.error("Failed to fetch progress insights:", error);
            return NextResponse.json(
                { error: "Failed to fetch progress insights" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            data: {
                insights: insights ?? [],
                total: count ?? 0,
                page,
                pageSize,
                hasMore: (count ?? 0) > page * pageSize,
            },
        });
    } catch (error) {
        console.error("Progress insights fetch failed:", error);
        return NextResponse.json(
            { error: "Failed to fetch progress insights" },
            { status: 500 },
        );
    }
};
