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

    const supabase = await createSupabaseServer();
    return persistPromptForEntry(supabase, userId, promptText, entryId);
};
