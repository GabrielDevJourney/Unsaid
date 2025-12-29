import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateWithProgressPayload, ServiceResult } from "@/types";
import { deleteUser, insertUser, insertUserProgress } from "./repo";

type CreateUserResult = {
    userId: string;
};

/**
 * Create a user and initialize their progress tracking.
 *
 * Handles idempotency: if user already exists (duplicate webhook), succeeds silently.
 * Throws on unexpected DB errors (controller should catch and log).
 */
export const createUserWithProgress = async (
    supabase: SupabaseClient,
    user: CreateWithProgressPayload,
): Promise<ServiceResult<CreateUserResult>> => {
    const { error: userError } = await insertUser(supabase, {
        id: user.id,
        email: user.email,
        subscription_status: "trial",
    });

    // 23505 = unique constraint violation (duplicate user from webhook retry)
    if (userError && userError.code !== "23505") {
        throw userError;
    }

    const { error: progressError } = await insertUserProgress(
        supabase,
        user.id,
    );

    if (progressError) {
        // Rollback user creation on progress failure
        await deleteUser(supabase, user.id);
        throw progressError;
    }

    return { data: { userId: user.id } };
};
