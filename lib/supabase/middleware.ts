import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

/**
 * Creates a Supabase client for middleware user existence check.
 * Uses service role to bypass RLS since we're just checking if user exists.
 */
export const createSupabaseMiddleware = () => {
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!supabaseServiceKey) {
        throw new Error("Missing SUPABASE_SECRET_KEY");
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};
