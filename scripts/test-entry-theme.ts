/**
 * Quick test for entry theme prompts feature.
 *
 * Tests both scenarios:
 * 1. New user (0 entries) → should get default prompt
 * 2. User with entries → should get AI-generated contextual prompt
 *
 * Usage:
 *   npx tsx scripts/test-entry-theme.ts <user_id>
 *
 * Example:
 *   npx tsx scripts/test-entry-theme.ts user_abc123
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

const userId = process.argv[2];

if (!userId) {
    console.error("Usage: npx tsx scripts/test-entry-theme.ts <user_id>");
    process.exit(1);
}

const main = async () => {
    console.log("\n🧪 Entry Theme Prompts Test");
    console.log("===========================");
    console.log(`User ID: ${userId}\n`);

    // Check current entry count
    const { count } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    console.log(`📊 Current entries: ${count ?? 0}\n`);

    // Import and test the service directly
    const { getEntryThemePrompt } = await import("../lib/prompts/service");

    console.log("🔄 Generating entry theme prompt...\n");

    // Pass userId since we're using admin client (no RLS)
    const result = await getEntryThemePrompt(supabase, userId);

    console.log("✅ Result:");
    console.log("─".repeat(50));
    console.log(`Prompt: "${result.promptText}"`);
    console.log(`Is Default: ${result.isDefault}`);
    console.log("─".repeat(50));

    if (result.isDefault) {
        console.log(
            "\n💡 Got default prompt (user has 0 entries or AI failed)",
        );
    } else {
        console.log("\n💡 Got AI-generated contextual prompt!");
    }

    // Test refresh (generate another one)
    console.log("\n🔄 Testing refresh (generating another)...\n");

    const refreshResult = await getEntryThemePrompt(supabase, userId);

    console.log("✅ Refresh Result:");
    console.log("─".repeat(50));
    console.log(`Prompt: "${refreshResult.promptText}"`);
    console.log(`Is Default: ${refreshResult.isDefault}`);
    console.log("─".repeat(50));

    if (!result.isDefault && result.promptText !== refreshResult.promptText) {
        console.log("\n✨ Different prompts generated - variety working!");
    }
};

main().catch(console.error);
