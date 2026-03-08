/**
 * Seeder script to test the weekly patterns UI flow.
 *
 * Inserts real weekly_insight + weekly_insight_patterns rows using the repo
 * functions so encryption is handled automatically. Skips the AI pipeline.
 *
 * Usage:
 *   npx tsx scripts/seed-pattern-test.ts <user_id> [options]
 *
 * Options:
 *   --clean    Delete existing weekly insights + patterns before seeding
 *
 * Examples:
 *   npx tsx scripts/seed-pattern-test.ts user_abc123
 *   npx tsx scripts/seed-pattern-test.ts user_abc123 --clean
 *
 * What to verify in the browser after running:
 *   1. /patterns       — cards appear, all show "New" badge
 *   2. Click a card    — navigates to /patterns/[id]
 *   3. Go back         — "New" badge is gone for the card you clicked
 *   4. Sidebar badge   — count drops after viewing
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { PatternTypeCode } from "../lib/constants/pattern-types";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// ─── Test data ────────────────────────────────────────────────────────────────

const WEEK_START = "2026-09-16";

const TEST_PATTERNS: Array<{
    title: string;
    patternType: PatternTypeCode;
    description: string;
    question: string;
    suggestedExperiment: string;
}> = [
    {
        title: "Avoidance Under Deadline Pressure",
        patternType: "behavioral_pattern",
        description:
            "When facing tight deadlines, you consistently shift focus to low-priority tasks rather than confronting the harder work directly. This shows up as prolonged setup rituals, over-organising notes, or starting adjacent tasks.",
        question:
            "What would it feel like to open the hard task first, before anything else?",
        suggestedExperiment:
            "For one week, start each work session with the task you least want to do. Keep it to 15 minutes. Notice whether the resistance changes after you begin.",
    },
    {
        title: "Self-Criticism After Social Interactions",
        patternType: "behavioral_pattern",
        description:
            "After conversations — especially ones that felt important — you replay what you said and look for mistakes. The review is rarely neutral; it tends toward cataloguing failures rather than noticing what went well.",
        question:
            "If a close friend described that same conversation, what would they highlight?",
        suggestedExperiment:
            "After your next social event, write three things that went fine or better than expected before allowing yourself to analyse anything.",
    },
    {
        title: "Difficulty Receiving Help",
        patternType: "unmet_need",
        description:
            "Across multiple entries you describe deflecting offers of support, minimising struggles when others ask, or routing around asking directly for what you need. Accepting help seems to carry a cost that giving help does not.",
        question:
            "What does accepting help mean to you about yourself or the relationship?",
        suggestedExperiment:
            "In the next two weeks, accept one offer of help without qualifying it or immediately reciprocating. Just say yes.",
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseArgs = () => {
    const args = process.argv.slice(2);
    const userId = args.find((arg) => !arg.startsWith("--"));

    if (!userId) {
        console.error(
            "Usage: npx tsx scripts/seed-pattern-test.ts <user_id> [--clean]",
        );
        process.exit(1);
    }

    return {
        userId,
        shouldClean: args.includes("--clean"),
    };
};

/**
 * Fetch the user's most recent entry IDs to use as evidence.
 * Falls back to empty array if no entries exist.
 */
const getRecentEntryIds = async (
    userId: string,
    limit: number,
): Promise<string[]> => {
    const { data } = await supabase
        .from("entries")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    return (data ?? []).map((e) => e.id);
};

const cleanExistingInsights = async (userId: string) => {
    console.log("Cleaning existing weekly insights...");
    const { error } = await supabase
        .from("weekly_insights")
        .delete()
        .eq("user_id", userId);

    if (error) {
        console.error("Failed to clean insights:", error);
        process.exit(1);
    }
    console.log("Done.\n");
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
    const { userId, shouldClean } = parseArgs();

    console.log("\nPattern Test Seeder");
    console.log("===================");
    console.log(`User ID:    ${userId}`);
    console.log(`Week start: ${WEEK_START}`);
    console.log(`Clean:      ${shouldClean}`);
    console.log("");

    if (shouldClean) {
        await cleanExistingInsights(userId);
    }

    // Pull real entry IDs so the reference timeline links work
    const entryIds = await getRecentEntryIds(userId, 3);
    if (entryIds.length === 0) {
        console.log(
            "No entries found — patterns will have empty reference timelines.\n",
        );
    } else {
        console.log(`Using ${entryIds.length} existing entries as evidence.\n`);
    }

    // Use repo functions so encryption is handled automatically
    const { insertWeeklyInsight, insertWeeklyInsightPatterns } = await import(
        "../lib/weekly-insights/repo"
    );

    // 1. Create the parent weekly insight record
    const { data: insight, error: insightError } = await insertWeeklyInsight(
        supabase,
        {
            userId,
            weekStart: WEEK_START,
            entryIds,
        },
    );

    if (insightError || !insight) {
        console.error("Failed to insert weekly insight:", insightError);
        process.exit(1);
    }

    console.log(`Created weekly insight: ${insight.id}`);

    // 2. Insert patterns — evidence spread across them so each gets ~1 entry link
    const patternsWithEvidence = TEST_PATTERNS.map((p, i) => ({
        ...p,
        evidence: entryIds.filter((_, j) => j % TEST_PATTERNS.length === i),
    }));

    const { data: patterns, error: patternsError } =
        await insertWeeklyInsightPatterns(
            supabase,
            insight.id,
            patternsWithEvidence,
        );

    if (patternsError) {
        console.error("Failed to insert patterns:", patternsError);
        process.exit(1);
    }

    console.log(`Created ${patterns.length} patterns:\n`);
    for (const p of patterns) {
        console.log(`  [${p.id}]`);
        console.log(`  Title:     ${p.title}`);
        console.log(`  Type:      ${p.patternType}`);
        console.log(
            `  is_viewed: ${p.isViewed}  →  "New" badge: ${!p.isViewed}`,
        );
        console.log("");
    }

    console.log("Done!\n");
    console.log("What to verify:");
    console.log("  1. /patterns          — three cards, all show 'New' badge");
    console.log("  2. Click a card       — goes to /patterns/[id]");
    console.log("  3. Go back            — 'New' badge gone for viewed card");
    console.log("  4. Sidebar badge      — count drops after each view");
    console.log("  5. Reference timeline — date links if entries exist\n");
};

main().catch(console.error);
