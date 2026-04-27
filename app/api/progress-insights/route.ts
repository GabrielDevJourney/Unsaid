import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProgressInsightsPaginated } from "@/lib/progress-insights/service";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isServiceError } from "@/types";

const QuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * GET /api/progress-insights/
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
        const supabase = await createSupabaseServer();

        const result = await getProgressInsightsPaginated(
            supabase,
            userId,
            page,
            pageSize,
        );

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            data: {
                insights: result.data.insights,
                total: result.data.count,
                page,
                pageSize,
                hasMore: result.data.count > page * pageSize,
            },
        });
    } catch (error) {
        Sentry.captureException(error);
        console.error("Progress insights fetch failed:", error);
        return NextResponse.json(
            { error: "Failed to fetch progress insights" },
            { status: 500 },
        );
    }
};
