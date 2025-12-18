import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase client for Server Components and API routes.
 * Injects Clerk session token - RLS policies filter by user automatically.
 */
export const createSupabaseServer = async () => {
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for admin client");
    }
    if (!supabaseAnonKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for admin client",
        );
    }
    const { getToken } = await auth();

    return createClient(supabaseUrl, supabaseAnonKey, {
        async accessToken() {
            return (await getToken()) ?? null;
        },
    });
};
