import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RelatedEntriesQuerySchema } from "@/lib/schemas/semantic-search";
import { getRelatedEntries } from "@/lib/semantic-search/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isServiceError } from "@/types";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/entries/:id/related - Find entries related to a specific entry
 *
 * Query params:
 * - limit: Max results to return (default 5, max 20)
 * - threshold: Minimum similarity score (default 0.5, range 0-1)
 */
export const GET = async (req: NextRequest, { params }: RouteParams) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { error: "Entry ID is required" },
                { status: 400 },
            );
        }

        const { searchParams } = new URL(req.url);
        const queryInput = {
            limit: searchParams.get("limit") ?? "5",
            threshold: searchParams.get("threshold") ?? "0.5",
        };

        const validated = RelatedEntriesQuerySchema.safeParse(queryInput);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { limit, threshold } = validated.data;

        // Admin client required: RPC functions use SECURITY DEFINER and filter
        // by userId param (not RLS token). User isolation is enforced in the RPC.
        const supabase = createSupabaseAdmin();
        const result = await getRelatedEntries(
            supabase,
            userId,
            id,
            limit,
            threshold,
        );

        if (isServiceError(result)) {
            // Entry not found returns 404
            if (result.error === "Entry not found") {
                return NextResponse.json(
                    { error: result.error },
                    { status: 404 },
                );
            }
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        console.error("Related entries search failed:", error);
        return NextResponse.json(
            { error: "Failed to find related entries. Please try again." },
            { status: 500 },
        );
    }
};
