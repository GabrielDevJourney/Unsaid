"use server";

import { z } from "zod";
import { markProgressInsightViewed } from "@/lib/progress-insights/service";
import { createSupabaseServer } from "@/lib/supabase/server";

export const markProgressInsightAsViewedAction = async (
    insightId: string,
): Promise<{ data: true } | { error: string }> => {
    const parsed = z.string().uuid().safeParse(insightId);
    if (!parsed.success) return { error: "Invalid insight ID" };

    try {
        const supabase = await createSupabaseServer();
        await markProgressInsightViewed(supabase, parsed.data);
        return { data: true };
    } catch {
        return { error: "Failed to mark insight as viewed" };
    }
};
