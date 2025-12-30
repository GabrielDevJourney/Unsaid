import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { createProgressInsight } from "@/lib/progress-insights/service";
import { GenerateProgressInsightRequestSchema } from "@/lib/schemas/progress-insight";
import { getProgressStatus } from "@/lib/triggers/check-progress-trigger";
import { isServiceError } from "@/types";

/**
 * POST /api/insights/progress/generate
 *
 * Manually trigger generation of a progress insight.
 * Checks if requirements are met (15 entries since last insight).
 * Use forceGenerate: true to bypass the check.
 *
 * Typically called internally after entry creation, but exposed
 * for manual testing and admin use.
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

        // Parse and validate request body
        const body = await req.json().catch(() => ({}));
        const validated = GenerateProgressInsightRequestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues },
                { status: 400 },
            );
        }

        const { forceGenerate } = validated.data;

        // Check if progress insight should trigger
        if (!forceGenerate) {
            const { data: status, error: statusError } =
                await getProgressStatus(userId);

            if (statusError) {
                return NextResponse.json(
                    { error: statusError },
                    { status: 500 },
                );
            }

            if (!status?.shouldTrigger) {
                return NextResponse.json(
                    {
                        error: "Not enough entries for progress insight",
                        details: {
                            totalEntries: status?.totalEntries ?? 0,
                            entriesUntilNext: status?.entriesUntilNext ?? 15,
                        },
                    },
                    { status: 400 },
                );
            }
        }

        // Generate the progress insight
        const result = await createProgressInsight(userId);

        if (isServiceError(result)) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            data: result.data,
        });
    } catch (error) {
        console.error("Progress insight generation failed:", error);
        return NextResponse.json(
            { error: "Failed to generate progress insight" },
            { status: 500 },
        );
    }
};

/**
 * GET /api/insights/progress/generate
 *
 * Check if a progress insight can be generated.
 * Returns current progress status without generating.
 */
export const GET = async () => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { data: status, error: statusError } =
            await getProgressStatus(userId);

        if (statusError) {
            return NextResponse.json({ error: statusError }, { status: 500 });
        }

        return NextResponse.json({
            data: status,
        });
    } catch (error) {
        console.error("Progress status check failed:", error);
        return NextResponse.json(
            { error: "Failed to check progress status" },
            { status: 500 },
        );
    }
};
