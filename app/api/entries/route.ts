import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
    createEntry,
    getEntriesWithInsightsPaginated,
} from "@/lib/entries/service";
import { EntryCreateSchema, PaginationSchema } from "@/lib/schemas/entry";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isServiceError } from "@/types";

/**
 * POST /api/entries - Create a new journal entry
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
        const validated = EntryCreateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error:
                        validated.error.issues[0]?.message ?? "Invalid request",
                },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServer();
        const result = await createEntry(supabase, userId, validated.data);

        if (isServiceError(result)) {
            const status =
                result.error === "FREE_LIMIT_REACHED"
                    ? 403
                    : result.error === "rate_limit"
                      ? 429
                      : 500;
            return NextResponse.json({ error: result.error }, { status });
        }

        return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0]?.message ?? "Invalid request" },
                { status: 400 },
            );
        }

        Sentry.captureException(error);
        console.error("Entry creation failed:", error);
        return NextResponse.json(
            { error: "Failed to create entry" },
            { status: 500 },
        );
    }
};

/**
 * GET /api/entries - List entries with pagination
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
            pageSize: searchParams.get("pageSize") ?? "20",
        };

        const pagination = PaginationSchema.safeParse(paginationInput);
        if (!pagination.success) {
            return NextResponse.json(
                {
                    error:
                        pagination.error.issues[0]?.message ??
                        "Invalid request",
                },
                { status: 400 },
            );
        }

        const { page, pageSize } = pagination.data;

        const supabase = await createSupabaseServer();
        const result = await getEntriesWithInsightsPaginated(
            supabase,
            page,
            pageSize,
            userId,
        );

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        const total = result.data.count;
        const offset = (page - 1) * pageSize;

        return NextResponse.json({
            data: result.data.entries,
            pagination: {
                page,
                pageSize,
                total,
                hasMore: total > offset + pageSize,
            },
        });
    } catch (error) {
        Sentry.captureException(error);
        console.error("Failed to fetch entries:", error);
        return NextResponse.json(
            { error: "Failed to fetch entries" },
            { status: 500 },
        );
    }
};
