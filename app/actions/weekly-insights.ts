"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { markPatternAsViewed } from "@/lib/weekly-insights/service";
import type { ServiceResult } from "@/types";

export const markPatternAsViewedAction = async (
    patternId: string,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const supabase = await createSupabaseServer();
        const result = await markPatternAsViewed(supabase, patternId);
        revalidatePath("/", "layout");
        return result;
    } catch (err) {
        console.error("markPatternAsViewedAction failed:", err);
        return { error: "Failed to mark pattern as viewed" };
    }
};
