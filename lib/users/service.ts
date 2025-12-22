import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateWithProgressPayload } from "@/types";
import { deleteUser, insertUser, insertUserProgress } from "./repo";

export async function createUserWithProgress(
    supabase: SupabaseClient,
    user: CreateWithProgressPayload,
) {
    const { error: userError } = await insertUser(supabase, {
        id: user.id,
        email: user.email,
        subscription_status: "trial",
    });

    if (userError && userError.code !== "23505") {
        throw userError;
    }

    const { error: progressError } = await insertUserProgress(
        supabase,
        user.id,
    );

    if (progressError) {
        await deleteUser(supabase, user.id);
        throw progressError;
    }

    return { success: true };
}
