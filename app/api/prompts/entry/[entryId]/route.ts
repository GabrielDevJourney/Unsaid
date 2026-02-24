import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadPromptForEntry } from "@/lib/prompts/service";
import { createSupabaseServer } from "@/lib/supabase/server";

export const GET = async (
    _req: Request,
    { params }: { params: Promise<{ entryId: string }> },
) => {
    try {
        const [{ userId }, { entryId }, supabase] = await Promise.all([
            auth(),
            params,
            createSupabaseServer(),
        ]);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
        const promptText = await loadPromptForEntry(supabase, entryId);

        return NextResponse.json({ data: { promptText } });
    } catch (error) {
        console.error("Failed to load entry prompt:", error);
        return NextResponse.json(
            { error: "Failed to load prompt" },
            { status: 500 },
        );
    }
};
