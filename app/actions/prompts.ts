"use server";

import { auth } from "@clerk/nextjs/server";
import { persistPromptForEntry } from "@/lib/prompts/service";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ServiceResult } from "@/types";

export const savePromptAction = async (
    promptText: string,
    entryId: string,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const supabase = await createSupabaseServer();
        await persistPromptForEntry(supabase, userId, promptText, entryId);
        return { data: null };
    } catch (err) {
        console.error("savePromptAction failed:", err);
        return { error: "Failed to save prompt" };
    }
};
