import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase client for Server Components and API routes.
 * Injects Clerk session token - RLS policies filter by user automatically.
 */
export const createSupabaseServer = async () => {
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for server client");
    }
    if (!supabasePublishableKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for server client",
        );
    }
    const { getToken } = await auth();

    return createClient(supabaseUrl, supabasePublishableKey, {
        async accessToken() {
            return (await getToken()) ?? null;
        },
    });
};
