import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateWithProgressPayload {
    id: string;
    email: string;
}
export const userService = {
    async createWithProgress(
        supabase: SupabaseClient,
        user: CreateWithProgressPayload,
    ) {
        // 1. Insert User
        const { error: userError } = await supabase.from("users").insert({
            user_id: user.id,
            email: user.email,
            subscription_status: "trial",
        });

        if (userError && userError.code !== "23505") throw userError;

        // 2. Insert Progress
        const { error: progressError } = await supabase
            .from("user_progress")
            .insert({
                user_id: user.id,
                total_entries: 0,
            });

        if (progressError) {
            // Rollback
            await supabase.from("users").delete().eq("user_id", user.id);
            throw progressError;
        }

        return { success: true };
    },

    async handleDeletion(supabase: SupabaseClient, userId: string) {
        // This is where you'll eventually choose between Hard or Soft delete
        return await supabase.from("users").delete().eq("user_id", userId);
    },
};
