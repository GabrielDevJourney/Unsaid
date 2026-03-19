"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
    type NotificationPreferences,
    updateNotificationPreferences,
    updateUserProfile,
} from "@/lib/users/repo";
import type { ServiceResult } from "@/types";

export const updateUsernameAction = async (
    username: string,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const trimmed = username.trim();
    if (trimmed.length < 3)
        return { error: "Username must be at least 3 characters" };
    if (trimmed.length > 30) return { error: "Username too long" };

    try {
        const client = await clerkClient();
        await client.users.updateUser(userId, { username: trimmed });

        const supabase = createSupabaseAdmin();
        await updateUserProfile(supabase, userId, { username: trimmed });

        return { data: null };
    } catch (err) {
        console.error("updateUsernameAction failed:", err);
        return { error: "Failed to update username" };
    }
};

export const updateAvatarAction = async (
    formData: FormData,
): Promise<ServiceResult<{ imageUrl: string }>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const file = formData.get("avatar");
    if (!(file instanceof File)) return { error: "No file provided" };
    if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5MB" };

    try {
        const client = await clerkClient();
        const updated = await client.users.updateUserProfileImage(userId, {
            file,
        });
        return { data: { imageUrl: updated.imageUrl } };
    } catch (err) {
        console.error("updateAvatarAction failed:", err);
        return { error: "Failed to update avatar" };
    }
};

export const updateNotificationPreferencesAction = async (
    prefs: Partial<NotificationPreferences>,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const supabase = await createSupabaseServer();
    await updateNotificationPreferences(supabase, userId, prefs);

    return { data: null };
};
