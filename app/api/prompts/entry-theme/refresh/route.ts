import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getEntryThemePrompt } from "@/lib/prompts/service";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/prompts/entry-theme/refresh - Force generate a new writing prompt
 *
 * Same as GET but explicitly for refreshing.
 * In v1.1 with caching, this will bypass/invalidate the cache.
 */
export const POST = async () => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const supabase = await createSupabaseServer();
        const result = await getEntryThemePrompt(supabase);

        return NextResponse.json({
            data: {
                promptText: result.promptText,
                isDefault: result.isDefault,
            },
        });
    } catch (error) {
        console.error("Failed to refresh entry theme prompt:", error);
        return NextResponse.json(
            { error: "Failed to refresh writing prompt" },
            { status: 500 },
        );
    }
};
