import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getWeeklyInsightWithPatternsPaginated } from "@/lib/weekly-insights/service";

const DEFAULT_LIMIT = 5;

/**
 * GET /api/weekly-insights?cursor=<week_start>&limit=<n>
 *
 * Returns weekly insights with nested patterns, cursor-paginated newest first.
 * Used by the patterns page infinite scroll after the initial server-rendered load.
 *
 * Query params:
 *   cursor - week_start of the last fetched insight (omit for first page)
 *   limit  - number of weeks to fetch (default 5)
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
        const cursor = searchParams.get("cursor") ?? null;
        const limitParam = searchParams.get("limit");
        const limit = limitParam
            ? Math.min(Number(limitParam), 20)
            : DEFAULT_LIMIT;

        if (Number.isNaN(limit) || limit < 1) {
            return NextResponse.json(
                { error: "Invalid limit" },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServer();
        const { data, nextCursor, error } =
            await getWeeklyInsightWithPatternsPaginated(
                supabase,
                cursor,
                limit,
            );

        if (error) {
            console.error("Failed to fetch weekly insights:", error);
            return NextResponse.json(
                { error: "Failed to fetch weekly insights" },
                { status: 500 },
            );
        }

        return NextResponse.json({ data, nextCursor });
    } catch (error) {
        console.error("Failed to fetch weekly insights:", error);
        return NextResponse.json(
            { error: "Failed to fetch weekly insights" },
            { status: 500 },
        );
    }
};
