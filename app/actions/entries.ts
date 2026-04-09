"use server";

import { auth } from "@clerk/nextjs/server";
import { createEntry, deleteEntryById } from "@/lib/entries/service";
import { EntryCreateSchema } from "@/lib/schemas/entry";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Entry, ServiceResult } from "@/types";

export const createEntryAction = async (
    content: string,
    sourceType?: string | null,
    sourceId?: string | null,
): Promise<ServiceResult<Entry>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const validated = EntryCreateSchema.safeParse({ content });
    if (!validated.success) {
        return { error: validated.error.issues[0]?.message ?? "Invalid input" };
    }

    try {
        const supabase = await createSupabaseServer();
        return createEntry(supabase, userId, {
            content: validated.data.content,
            sourceType: sourceType ?? null,
            sourceId: sourceId ?? null,
        });
    } catch (err) {
        console.error("createEntryAction failed:", err);
        return { error: "Failed to create entry" };
    }
};

export const deleteEntryAction = async (
    entryId: string,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const supabase = await createSupabaseServer();
        return deleteEntryById(supabase, userId, entryId);
    } catch (err) {
        console.error("deleteEntryAction failed:", err);
        return { error: "Failed to delete entry" };
    }
};
