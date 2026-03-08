import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getEntryWithInsightById } from "@/lib/entries/repo";
import { saveEntry } from "@/lib/entries/service";
import { EntryCreateSchema } from "@/lib/schemas/entry";
import { createSupabaseServer } from "@/lib/supabase/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/entries/:id - Get a single entry by ID
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

        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { error: "Entry ID is required" },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServer();
        const { data: entry, error } = await getEntryWithInsightById(
            supabase,
            id,
        );

        if (error) {
            // PGRST116 = no rows returned (not found or RLS blocked)
            if ("code" in error && error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Entry not found" },
                    { status: 404 },
                );
            }

            console.error("Failed to fetch entry:", error);
            return NextResponse.json(
                { error: "Failed to fetch entry" },
                { status: 500 },
            );
        }

        return NextResponse.json({ data: entry });
    } catch (error) {
        console.error("Failed to fetch entry:", error);
        return NextResponse.json(
            { error: "Failed to fetch entry" },
            { status: 500 },
        );
    }
};

/**
 * PATCH /api/entries/:id - Update entry content
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
        if (!id) {
            return NextResponse.json(
                { error: "Entry ID is required" },
                { status: 400 },
            );
        }

        const body = await req.json();
        const validated = EntryCreateSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                {
                    error:
                        validated.error.issues[0]?.message ?? "Invalid input",
                },
                { status: 422 },
            );
        }

        const supabase = await createSupabaseServer();
        const result = await saveEntry(supabase, id, validated.data.content);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        console.error("Failed to save entry:", error);
        return NextResponse.json(
            { error: "Failed to save entry" },
            { status: 500 },
        );
    }
};
