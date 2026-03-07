import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { SemanticSearchQuerySchema } from "@/lib/schemas/semantic-search";
import { searchPatterns } from "@/lib/semantic-search/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isServiceError } from "@/types";

/**
 * GET /api/weekly-insights/search - Search weekly insight patterns by semantic similarity
 *
 * Query params:
 * - q: Search query text (required, min 3 chars)
 * - limit: Max results to return (default 10, max 50)
 * - threshold: Minimum similarity score (default 0.5, range 0-1)
 */

export const GET = async (req: NextRequest) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        const { searchParams } = new URL(req.url);
        const queryInput = {
            q: searchParams.get("q") ?? "",
            limit: searchParams.get("limit") ?? "10",
            threshold: searchParams.get("threshold") ?? "0.5",
        };

        const validated = SemanticSearchQuerySchema.safeParse(queryInput);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { q, limit, threshold } = validated.data;

        const supabase = createSupabaseAdmin();
        const result = await searchPatterns(
            supabase,
            userId,
            q,
            limit,
            threshold,
        );

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        console.error("Error searching weekly insights:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 },
        );
    }
};
