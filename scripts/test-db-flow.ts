/**
 * Database Flow Test Script
 *
 * Tests the complete flow after schema changes:
 * - Entry creation with embedding (vector in extensions schema)
 * - Entry insight (Tier 1)
 * - Weekly insight with patterns (Tier 2)
 * - Progress insight (Tier 3)
 * - Entry theme prompt generation
 * - Semantic search functions
 *
 * Usage:
 *   npx tsx scripts/test-db-flow.ts [user_id]
 *
 * If no user_id provided, creates a test user.
 */

import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embed } from "ai";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Test entries - short but meaningful
const TEST_ENTRIES = [
    `Today was challenging at work. The project deadline moved up again and I felt overwhelmed.
     But I managed to set a small boundary - I told my manager I needed to prioritize.
     It felt scary but also empowering. Small wins matter.`,

    `Had coffee with an old friend. We talked about life changes and I realized how much
     I've been isolating myself. Connection feels good. I want to do this more often.
     Note to self: reach out to people, don't wait for them to reach out.`,

    `Morning run today - first one in weeks. My body complained but my mind thanked me.
     There's something about physical movement that clears the mental fog.
     Going to try for twice this week. Baby steps.`,
];

const log = (emoji: string, message: string) => {
    console.log(`${emoji} ${message}`);
};

const logSection = (title: string) => {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`  ${title}`);
    console.log("=".repeat(50));
};

/**
 * Generate embedding
 */
const generateEmbedding = async (content: string): Promise<number[]> => {
    const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
    });
    return embedding;
};

/**
 * Ensure test user exists
 */
const ensureTestUser = async (userId: string) => {
    const { data } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    if (!data) {
        log("👤", `Creating test user: ${userId}`);
        await supabase
            .from("users")
            .insert({ user_id: userId, email: `${userId}@test.local` });
        await supabase
            .from("subscriptions")
            .insert({ user_id: userId, status: "active" });
        await supabase.from("user_progress").insert({
            user_id: userId,
            total_entries: 0,
            entry_count_at_last_progress: 0,
        });
    } else {
        log("👤", `Using existing user: ${userId}`);
    }
};

/**
 * Clean test data
 */
const cleanTestData = async (userId: string) => {
    log("🧹", "Cleaning previous test data...");

    const { data: weeklyInsights } = await supabase
        .from("weekly_insights")
        .select("id")
        .eq("user_id", userId);

    if (weeklyInsights?.length) {
        await supabase
            .from("weekly_insight_patterns")
            .delete()
            .in(
                "weekly_insight_id",
                weeklyInsights.map((w) => w.id),
            );
    }

    await supabase.from("entry_insights").delete().eq("user_id", userId);
    await supabase.from("weekly_insights").delete().eq("user_id", userId);
    await supabase.from("progress_insights").delete().eq("user_id", userId);
    await supabase.from("entries").delete().eq("user_id", userId);
};

/**
 * Test 1: Create entries with embeddings using repo
 */
const testEntryCreation = async (userId: string) => {
    logSection("TEST 1: Entry Creation with Embeddings");

    const { insertEntry, updateEntryEmbedding } = await import(
        "../lib/entries/repo"
    );

    // Using inline type since dynamic imports don't work well with type-only imports
    // This matches EntryMinimal from @/types
    const entries: Array<{ id: string; content: string; createdAt: string }> =
        [];

    for (let i = 0; i < TEST_ENTRIES.length; i++) {
        const content = TEST_ENTRIES[i];
        const wordCount = content.split(/\s+/).length;

        log("📝", `Creating entry ${i + 1}/${TEST_ENTRIES.length}...`);

        // Create entry using repo (handles encryption)
        const { data: entry, error: insertError } = await insertEntry(
            supabase,
            {
                userId,
                content,
                wordCount,
            },
        );

        if (insertError || !entry) {
            log("❌", `  Failed: ${insertError?.message}`);
            throw insertError;
        }

        log("✅", `  Entry created: ${entry.id.slice(0, 8)}...`);

        // Generate and update embedding
        const embedding = await generateEmbedding(content);
        log("🧮", `  Embedding generated (${embedding.length} dimensions)`);

        const { error: embeddingError } = await updateEntryEmbedding(
            supabase,
            entry.id,
            JSON.stringify(embedding),
        );

        if (embeddingError) {
            log("⚠️", `  Embedding update failed: ${embeddingError.message}`);
        }

        entries.push({
            id: entry.id,
            content: entry.content,
            createdAt: entry.createdAt,
        });
    }

    return entries;
};

/**
 * Test 2: Entry Insight (Tier 1)
 */
const testEntryInsight = async (
    userId: string,
    entry: { id: string; content: string },
) => {
    logSection("TEST 2: Entry Insight (Tier 1)");

    log("🔮", "Generating entry insight...");

    const { streamEntryInsight } = await import(
        "../lib/ai/stream-entry-insight"
    );
    const { insertEntryInsight } = await import("../lib/entry-insights/repo");

    const result = await streamEntryInsight(entry.content);
    let insightText = "";
    for await (const chunk of result.textStream) {
        insightText += chunk;
    }

    log("💡", `  Insight preview: "${insightText.slice(0, 100)}..."`);

    const { error } = await insertEntryInsight(supabase, {
        userId,
        entryId: entry.id,
        content: insightText,
    });

    if (error) {
        log("❌", `  Failed to save: ${error.message}`);
        throw error;
    }

    log("✅", "Entry insight created and saved");
    return insightText;
};

/**
 * Test 3: Weekly Insight (Tier 2)
 */
const testWeeklyInsight = async (
    userId: string,
    entries: Array<{ id: string; content: string; createdAt: string }>,
) => {
    logSection("TEST 3: Weekly Insight (Tier 2)");

    log("📊", "Generating weekly insight...");

    const { createWeeklyInsight, getWeekStart } = await import(
        "../lib/weekly-insights/service"
    );

    const weekStart = getWeekStart(new Date(entries[0].createdAt));

    const result = await createWeeklyInsight(userId, {
        weekStart,
        entryIds: entries.map((e) => e.id),
        entries: entries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        })),
    });

    if ("error" in result) {
        log("❌", `  Failed: ${result.error}`);
        throw new Error(result.error);
    }

    log(
        "✅",
        `Weekly insight created with ${result.data?.patterns?.length ?? 0} patterns`,
    );

    if (result.data?.patterns?.length) {
        for (const pattern of result.data.patterns.slice(0, 2)) {
            log("  📌", `Pattern: ${pattern.title} (${pattern.patternType})`);
        }
    }

    return result.data;
};

/**
 * Test 4: Progress Insight (Tier 3)
 */
const testProgressInsight = async (
    userId: string,
    entries: Array<{ id: string; content: string; createdAt: string }>,
) => {
    logSection("TEST 4: Progress Insight (Tier 3)");

    log("📈", "Generating progress insight...");

    const { createProgressInsight } = await import(
        "../lib/progress-insights/service"
    );

    const result = await createProgressInsight(userId, {
        recentEntryIds: entries.map((e) => e.id),
        recentEntries: entries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        })),
        relatedPastEntries: [],
    });

    if ("error" in result) {
        log("❌", `  Failed: ${result.error}`);
        throw new Error(result.error);
    }

    log("✅", "Progress insight created");
    log("💡", `  Preview: "${result.data?.content?.slice(0, 100)}..."`);

    return result.data;
};

/**
 * Test 5: Entry Theme Prompt Generation
 */
const testEntryThemePrompt = async (userId: string) => {
    logSection("TEST 5: Entry Theme Prompt Generation");

    log("✍️", "Generating contextual writing prompt...");

    const { getEntryThemePrompt } = await import("../lib/prompts/service");

    const result = await getEntryThemePrompt(supabase, userId);

    if (!result.promptText) {
        log("❌", "  Failed to generate prompt");
        throw new Error("No prompt generated");
    }

    log("✅", `  Prompt generated (isDefault: ${result.isDefault})`);
    log("💭", `  "${result.promptText}"`);

    return result;
};

/**
 * Test 6: Semantic Search using repo
 */
const testSemanticSearch = async (
    userId: string,
    entries: Array<{ id: string; content: string }>,
) => {
    logSection("TEST 6: Semantic Search (Vector Functions)");

    const { searchEntriesByEmbedding, findRelatedEntries } = await import(
        "../lib/entries/repo"
    );

    log("🔍", "Testing searchEntriesByEmbedding...");

    // Generate embedding for a search query
    const searchQuery = "feeling overwhelmed at work";
    const queryEmbedding = await generateEmbedding(searchQuery);

    const { data: searchResults, error: searchError } =
        await searchEntriesByEmbedding(
            supabase,
            userId,
            JSON.stringify(queryEmbedding),
            5,
            0.3,
        );

    if (searchError) {
        log("❌", `  Search failed: ${searchError.message}`);
        throw searchError;
    }

    log("✅", `  Found ${searchResults?.length ?? 0} matching entries`);

    if (searchResults?.length) {
        for (const result of searchResults.slice(0, 2)) {
            log(
                "  📄",
                `Similarity: ${(result.similarity * 100).toFixed(1)}% - "${result.content.slice(0, 50)}..."`,
            );
        }
    }

    // Test findRelatedEntries
    log("🔍", "Testing findRelatedEntries...");

    const { data: relatedResults, error: relatedError } =
        await findRelatedEntries(supabase, userId, entries[0].id, 5, 0.3);

    if (relatedError) {
        log("❌", `  Related search failed: ${relatedError.message}`);
        throw relatedError;
    }

    log("✅", `  Found ${relatedResults?.length ?? 0} related entries`);

    return { searchResults, relatedResults };
};

/**
 * Main
 */
const main = async () => {
    const userId = process.argv[2] || `test-user-${Date.now()}`;

    console.log("\n🧪 DATABASE FLOW TEST");
    console.log(`   User: ${userId}`);
    console.log(`   Entries: ${TEST_ENTRIES.length}`);
    console.log(`   Time: ${new Date().toISOString()}\n`);

    try {
        await ensureTestUser(userId);
        await cleanTestData(userId);

        // Run all tests
        const entries = await testEntryCreation(userId);
        for (const entry of entries) {
            await testEntryInsight(userId, entry);
        }
        await testWeeklyInsight(userId, entries);
        await testProgressInsight(userId, entries);
        await testEntryThemePrompt(userId);
        await testSemanticSearch(userId, entries);

        // Update user progress
        await supabase.from("user_progress").upsert({
            user_id: userId,
            total_entries: entries.length,
            entry_count_at_last_progress: entries.length,
        });

        logSection("ALL TESTS PASSED ✅");
        console.log("\nDatabase flow is working correctly!");
        console.log(`Test user: ${userId}`);
        console.log("\nTo clean up, run:");
        console.log(`  npx tsx scripts/test-db-flow.ts ${userId}`);
        console.log("  (it auto-cleans previous test data)\n");
    } catch (error) {
        logSection("TEST FAILED ❌");
        console.error("\nError:", error);
        process.exit(1);
    }
};

main();
