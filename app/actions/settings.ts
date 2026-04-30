"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
    updateNotificationPreferences,
    updateUserProfile,
} from "@/lib/users/service";
import type { ServiceResult } from "@/types";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
];

const UsernameSchema = z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "Username can only contain letters, numbers, underscores, dots, and hyphens",
    );

const NotificationPreferencesSchema = z
    .object({
        notifyWeeklyPatterns: z.boolean().optional(),
        notifyProgressChecks: z.boolean().optional(),
        notifyWritingReminders: z.boolean().optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
        message: "At least one preference must be provided",
    });

export const updateUsernameAction = async (
    username: string,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = UsernameSchema.safeParse(username);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const client = await clerkClient();
        await client.users.updateUser(userId, { username: parsed.data });

        const supabase = await createSupabaseServer();
        const result = await updateUserProfile(supabase, userId, {
            username: parsed.data,
        });
        if (result.error) return { error: result.error };

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
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
        return { error: "File must be a JPEG, PNG, GIF, or WebP image" };
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
    rawPrefs: unknown,
): Promise<ServiceResult<null>> => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = NotificationPreferencesSchema.safeParse(rawPrefs);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const supabase = await createSupabaseServer();
    const { error } = await updateNotificationPreferences(
        supabase,
        userId,
        parsed.data,
    );
    if (error) {
        console.error("updateNotificationPreferencesAction failed:", error);
        return { error: "Failed to save notification preferences" };
    }

    return { data: null };
};
