"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
    cancelScheduledDeletion,
    initiateAccountDeletion,
} from "@/lib/users/service";
import type { ServiceResult } from "@/types";

export const initiateAccountDeletionAction = async (): Promise<
    ServiceResult<null>
> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const supabase = await createSupabaseServer();
        return initiateAccountDeletion(supabase, userId);
    } catch (err) {
        console.error("initiateAccountDeletionAction failed:", err);
        return { error: "Failed to initiate account deletion" };
    }
};

export const cancelScheduledDeletionAction = async (): Promise<
    ServiceResult<null>
> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const supabase = await createSupabaseServer();
        return cancelScheduledDeletion(supabase, userId);
    } catch (err) {
        console.error("cancelScheduledDeletionAction failed:", err);
        return { error: "Failed to cancel deletion" };
    }
};
