import type { SupabaseClient } from "@supabase/supabase-js";
import { insertSubscription } from "@/lib/subscriptions/repo";
import type { CreateWithProgressPayload, ServiceResult } from "@/types";
import { deleteUser, insertUser, insertUserProgress } from "./repo";

type CreateUserResult = {
    userId: string;
};

/**
 * Create a user and initialize their progress tracking and trial subscription.
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
        await deleteUser(supabase, user.id);
        throw progressError;
    }

    // Create trial subscription
    const { error: subscriptionError } = await insertSubscription(
        supabase,
        user.id,
    );

    // Ignore duplicate constraint (idempotent for webhook retries)
    if (subscriptionError && subscriptionError.code !== "23505") {
        await deleteUser(supabase, user.id);
        throw subscriptionError;
    }

    return { data: { userId: user.id } };
};
