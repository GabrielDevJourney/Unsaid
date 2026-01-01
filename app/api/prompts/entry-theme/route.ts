import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getEntryThemePrompt } from "@/lib/prompts/service";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/prompts/entry-theme - Get a contextual writing prompt
 *
 * Returns either:
 * - A random default prompt (for new users with 0 entries)
 * - An AI-generated contextual prompt based on recent entries
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

        const supabase = await createSupabaseServer();
        const result = await getEntryThemePrompt(supabase);

        return NextResponse.json({
            data: {
                promptText: result.promptText,
                isDefault: result.isDefault,
            },
        });
    } catch (error) {
        console.error("Failed to get entry theme prompt:", error);
        return NextResponse.json(
            { error: "Failed to get writing prompt" },
            { status: 500 },
        );
    }
};
