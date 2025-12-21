import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

/**
 * Creates a Supabase admin client that bypasses RLS.
 * Use only for system operations: cron jobs, webhooks, background tasks.
 */
export const createSupabaseAdmin = () => {
    if (!supabaseSecretKey) {
        throw new Error("Missing SUPABASE_SECRET_KEY for admin client");
    }
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for admin client");
    }

    return createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
