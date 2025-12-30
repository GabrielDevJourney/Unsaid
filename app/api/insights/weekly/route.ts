import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PaginationSchema } from "@/lib/schemas/entry";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getWeeklyInsightsPaginated } from "@/lib/weekly-insights/repo";

/**
 * GET /api/insights/weekly - List weekly insights with pagination
 *
 * Returns weekly insights sorted by week_start (newest first).
 * Each insight includes entry_ids but NOT patterns (use specific week endpoint for that).
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
        const paginationInput = {
            page: searchParams.get("page") ?? "1",
            pageSize: searchParams.get("pageSize") ?? "10",
        };

        const pagination = PaginationSchema.safeParse(paginationInput);
        if (!pagination.success) {
            return NextResponse.json(
                { error: pagination.error.issues },
                { status: 400 },
            );
        }

        const { page, pageSize } = pagination.data;

        const supabase = await createSupabaseServer();
        const {
            data: insights,
            count,
            error,
        } = await getWeeklyInsightsPaginated(supabase, userId, page, pageSize);

        if (error) {
            console.error("Failed to fetch weekly insights:", error);
            return NextResponse.json(
                { error: "Failed to fetch weekly insights" },
                { status: 500 },
            );
        }

        const total = count ?? 0;
        const offset = (page - 1) * pageSize;

        return NextResponse.json({
            data: insights ?? [],
            pagination: {
                page,
                pageSize,
                total,
                hasMore: total > offset + pageSize,
            },
        });
    } catch (error) {
        console.error("Failed to fetch weekly insights:", error);
        return NextResponse.json(
            { error: "Failed to fetch weekly insights" },
            { status: 500 },
        );
    }
};
