import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { WeekStartParamSchema } from "@/lib/schemas/weekly-insight";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getWeeklyInsightWithPatternsByWeekStart } from "@/lib/weekly-insights/repo";

interface RouteParams {
    params: Promise<{ weekStart: string }>;
}

/**
 * GET /api/insights/weekly/[weekStart] - Get weekly insight for a specific week
 *
 * Returns the weekly insight with all patterns for the given week.
 * weekStart must be in YYYY-MM-DD format (start of week date).
 */
export const GET = async (_req: NextRequest, { params }: RouteParams) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { weekStart } = await params;

        // Validate weekStart format
        const validated = WeekStartParamSchema.safeParse(weekStart);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServer();
        const { data: insight, error } =
            await getWeeklyInsightWithPatternsByWeekStart(
                supabase,
                userId,
                weekStart,
            );

        if (error) {
            // PGRST116 = no rows found
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Weekly insight not found for this week" },
                    { status: 404 },
                );
            }
            console.error("Failed to fetch weekly insight:", error);
            return NextResponse.json(
                { error: "Failed to fetch weekly insight" },
                { status: 500 },
            );
        }

        if (!insight) {
            return NextResponse.json(
                { error: "Weekly insight not found for this week" },
                { status: 404 },
            );
        }

        return NextResponse.json({ data: insight });
    } catch (error) {
        console.error("Failed to fetch weekly insight:", error);
        return NextResponse.json(
            { error: "Failed to fetch weekly insight" },
            { status: 500 },
        );
    }
};
