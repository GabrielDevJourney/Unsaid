import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateWithProgressPayload } from "@/types";

export const userService = {
    async createWithProgress(
        supabase: SupabaseClient,
        user: CreateWithProgressPayload,
    ) {
        const { error: userError } = await supabase.from("users").insert({
            user_id: user.id,
            email: user.email,
            subscription_status: "trial",
        });

        if (userError && userError.code !== "23505") throw userError;

        const { error: progressError } = await supabase
            .from("user_progress")
            .insert({
                user_id: user.id,
                total_entries: 0,
            });

        if (progressError) {
            await supabase.from("users").delete().eq("user_id", user.id);
            throw progressError;
        }

        return { success: true };
    },

    async handleDeletion(supabase: SupabaseClient, userId: string) {
        //TODO: to choose between hard or soft deletes
        return await supabase.from("users").delete().eq("user_id", userId);
    },
};
