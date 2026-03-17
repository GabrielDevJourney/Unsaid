import { currentUser } from "@clerk/nextjs/server";

export interface SettingsUser {
    username: string;
    imageUrl: string;
    email: string;
    memberSince: string;
}

export interface SettingsPageData {
    user: SettingsUser;
}

/**
 * Fetch all data needed for the settings page.
 * Returns null if user is not authenticated.
 * Ticket 4 will extend this with subscription data (add supabase param).
 */
export const getSettingsPageData =
    async (): Promise<SettingsPageData | null> => {
        const user = await currentUser();
        if (!user) return null;

        return {
            user: {
                username: user.username ?? "",
                imageUrl: user.imageUrl,
                email: user.primaryEmailAddress?.emailAddress ?? "",
                memberSince: new Date(user.createdAt).toISOString(),
            },
        };
    };
