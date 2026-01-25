/**
 * Email testing script - seeds data and triggers all 3 email types.
 *
 * Creates:
 * - User with trial expiring in 3 days (trial reminder email)
 * - 15 entries spread across last week (weekly patterns + progress check emails)
 *
 * Usage:
 *   npx tsx scripts/test-emails.ts <email> [options]
 *
 * Options:
 *   --dry-run       Don't actually send emails, just seed data
 *   --clean         Delete existing test data before seeding
 *   --trial-only    Only send trial reminder email
 *   --weekly-only   Only send weekly patterns email
 *   --progress-only Only send progress check email
 *
 * Examples:
 *   npx tsx scripts/test-emails.ts gabriel@example.com
 *   npx tsx scripts/test-emails.ts gabriel@example.com --dry-run
 *   npx tsx scripts/test-emails.ts gabriel@example.com --clean
 *   npx tsx scripts/test-emails.ts gabriel@example.com --trial-only
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

// Test user ID prefix for easy identification
const TEST_USER_PREFIX = "email_test_";

// Journal entries with recurring themes for pattern detection
const JOURNAL_ENTRIES = [
    `Today was rough. My manager asked me to take on another project and I said yes even though I'm already drowning. Why can't I just say no? I keep telling myself I'll set boundaries but then the moment comes and I fold.`,

    `Had lunch with Sarah and she mentioned how she pushed back on her boss's request last week. Just casually, like it was nothing. I sat there nodding but inside I was thinking "how does she do that?"`,

    `Couldn't sleep last night. Kept replaying that meeting where I volunteered to fix the deployment issue. It wasn't even my fault. But there I was, raising my hand like a good little soldier.`,

    `Therapy session today. We talked about the boundary thing again. Dr. Martinez asked what I'm afraid will happen if I say no. I said people won't like me. She asked if that's ever actually happened.`,

    `Small win: I didn't immediately respond to Jake's 9pm Slack message about "a quick favor." Waited until morning. The world didn't end. He didn't even mention it. Maybe people care less than I think they do?`,

    `Feeling burnt out. Took a half day but spent most of it thinking about work anyway. What's the point of time off if my brain won't turn off? I need to figure out how to actually rest.`,

    `Noticed something today. When Mom called asking me to help my brother move AGAIN, I felt the familiar knot in my stomach. But this time I heard my own voice saying "I'm not available that weekend."`,

    `Re-reading old entries and there's a pattern here. Every few weeks I write about being overwhelmed. Then I write about needing boundaries. Then nothing changes. Then I get overwhelmed again.`,

    `Good conversation with Alex. They pointed out that I apologize constantly—even when nothing is my fault. Started counting today. Lost track after 20. That can't be normal, right?`,

    `The project deadline got moved up. Instead of asking for help, I'm planning to work through the weekend. Even as I type this I know it's wrong.`,

    `Weird realization: I'm more comfortable being overwhelmed than being seen as incapable. When did that happen? When did struggle become safer than asking for support?`,

    `Tried the "pause before responding" thing Dr. Martinez suggested. Someone asked me to cover their shift. I said "let me check and get back to you." Didn't feel great but I did it.`,

    `Exhausted but can't stop. There's always one more email, one more task, one more person who needs something. I wonder what would happen if I just... stopped.`,

    `Three months into this job and I've already become the "reliable one." The one people come to when they need something done. I used to think that was a compliment. Now I'm not so sure.`,

    `Today I set a boundary. A real one. Told my team lead I couldn't take on the documentation project. My voice shook but I did it. She said "okay, I'll ask someone else." That was it.`,
];

/**
 * Parse command line arguments
 */
const parseArgs = () => {
    const args = process.argv.slice(2);
    const email = args.find(
        (arg) => !arg.startsWith("--") && arg.includes("@"),
    );

    if (!email) {
        console.error(
            "Usage: npx tsx scripts/test-emails.ts <email> [options]",
        );
        console.error("\nOptions:");
        console.error("  --dry-run       Don't send emails, just seed data");
        console.error("  --clean         Delete existing test data first");
        console.error("  --trial-only    Only send trial reminder email");
        console.error("  --weekly-only   Only send weekly patterns email");
        console.error("  --progress-only Only send progress check email");
        process.exit(1);
    }

    return {
        email,
        dryRun: args.includes("--dry-run"),
        clean: args.includes("--clean"),
        trialOnly: args.includes("--trial-only"),
        weeklyOnly: args.includes("--weekly-only"),
        progressOnly: args.includes("--progress-only"),
    };
};

/**
 * Generate embedding for content
 */
const generateEmbedding = async (content: string): Promise<string> => {
    const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
    });
    return JSON.stringify(embedding);
};

/**
 * Create or get test user
 */
const ensureTestUser = async (email: string) => {
    const userId = `${TEST_USER_PREFIX}${Date.now()}`;

    console.log(`Creating test user: ${userId}`);

    // Create user
    const { error: userError } = await supabase.from("users").insert({
        user_id: userId,
        email,
    });

    if (userError) {
        console.error("Failed to create user:", userError);
        process.exit(1);
    }

    // Create trial subscription expiring in 3 days (to trigger trial reminder)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        status: "trial",
        trial_ends_at: trialEndsAt.toISOString(),
    });

    if (subError) {
        console.error("Failed to create subscription:", subError);
        process.exit(1);
    }

    return userId;
};

/**
 * Clean test data
 */
const cleanTestData = async () => {
    console.log("Cleaning existing test data...");

    // Find all test users
    const { data: users } = await supabase
        .from("users")
        .select("user_id")
        .like("user_id", `${TEST_USER_PREFIX}%`);

    if (!users || users.length === 0) {
        console.log("No test data to clean.");
        return;
    }

    const userIds = users.map((u) => u.user_id);

    // Delete in order (respecting foreign keys)
    await supabase.from("entry_insights").delete().in("user_id", userIds);
    await supabase
        .from("weekly_insight_patterns")
        .delete()
        .in(
            "weekly_insight_id",
            (
                await supabase
                    .from("weekly_insights")
                    .select("id")
                    .in("user_id", userIds)
            ).data?.map((w) => w.id) ?? [],
        );
    await supabase.from("weekly_insights").delete().in("user_id", userIds);
    await supabase.from("progress_insights").delete().in("user_id", userIds);
    await supabase.from("entries").delete().in("user_id", userIds);
    await supabase.from("user_progress").delete().in("user_id", userIds);
    await supabase.from("subscriptions").delete().in("user_id", userIds);
    await supabase.from("users").delete().in("user_id", userIds);

    console.log(`Cleaned ${users.length} test users.`);
};

/**
 * Create entries spread across the last week using repos
 */
const createEntries = async (userId: string) => {
    console.log("\nCreating 15 entries spread across last week...");

    const { insertEntry, updateEntryEmbedding } = await import(
        "../lib/entries/repo"
    );

    const entries: Array<{ id: string; content: string; createdAt: string }> =
        [];

    for (let i = 0; i < 15; i++) {
        const content = JOURNAL_ENTRIES[i % JOURNAL_ENTRIES.length];
        const wordCount = content.split(/\s+/).length;

        // Spread entries across last 7 days (for weekly insights)
        const date = new Date();
        date.setDate(date.getDate() - (7 - Math.floor((i / 15) * 7)));
        date.setHours(9 + (i % 12), Math.floor(Math.random() * 60), 0, 0);

        console.log(`  Entry ${i + 1}/15...`);

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
            console.error(`Failed to create entry ${i + 1}:`, insertError);
            continue;
        }

        // Update created_at to staggered date
        await supabase
            .from("entries")
            .update({ created_at: date.toISOString() })
            .eq("id", entry.id);

        // Generate and update embedding
        const embedding = await generateEmbedding(content);
        const { error: embeddingError } = await updateEntryEmbedding(
            supabase,
            entry.id,
            embedding,
        );

        if (embeddingError) {
            console.error(
                `Failed to update embedding ${i + 1}:`,
                embeddingError,
            );
        }

        entries.push({
            id: entry.id,
            content: entry.content,
            createdAt: date.toISOString(),
        });

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Update user progress
    await supabase.from("user_progress").upsert({
        user_id: userId,
        total_entries: 15,
        entry_count_at_last_progress: 0,
    });

    return entries;
};

/**
 * Send trial reminder email
 */
const sendTrialReminder = async (email: string, dryRun: boolean) => {
    console.log("\n--- Trial Reminder Email ---");

    if (dryRun) {
        console.log("[DRY RUN] Would send trial reminder to:", email);
        return;
    }

    const { sendTrialEndingEmail } = await import("../lib/email/service");

    const result = await sendTrialEndingEmail(email, email.split("@")[0], 3, {
        entriesWritten: 15,
        insightsReceived: 15,
    });

    if (result.success) {
        console.log("Trial reminder sent to:", email);
    } else {
        console.error("Failed to send trial reminder:", result.error);
    }
};

/**
 * Generate and send weekly patterns email
 */
const sendWeeklyPatterns = async (
    userId: string,
    email: string,
    entries: Array<{ id: string; content: string; createdAt: string }>,
    dryRun: boolean,
) => {
    console.log("\n--- Weekly Patterns Email ---");

    // Get week start (last Monday)
    const { getWeekStart } = await import("../lib/weekly-insights/service");
    const today = new Date();
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const weekStart = getWeekStart(lastWeekDate);

    console.log(`Generating weekly insight for week: ${weekStart}`);

    // Generate weekly insight
    const { createWeeklyInsight } = await import(
        "../lib/weekly-insights/service"
    );
    const { isServiceError } = await import("../types");

    const result = await createWeeklyInsight(userId, {
        weekStart,
        entryIds: entries.map((e) => e.id),
        entries: entries.map((e) => ({
            id: e.id,
            content: e.content,
            createdAt: e.createdAt,
        })),
    });

    if (isServiceError(result)) {
        console.error("Failed to generate weekly insight:", result.error);
        return;
    }

    console.log(`Generated ${result.data.patterns?.length ?? 0} patterns`);

    if (dryRun) {
        console.log("[DRY RUN] Would send weekly patterns email to:", email);
        return;
    }

    // Send email
    const { sendWeeklyPatternsEmail } = await import("../lib/email/service");

    const patternPreviews = (result.data.patterns ?? [])
        .slice(0, 3)
        .map((p) => p.title);

    const emailResult = await sendWeeklyPatternsEmail(
        email,
        email.split("@")[0],
        result.data.patterns?.length ?? 0,
        patternPreviews,
    );

    if (emailResult.success) {
        console.log("Weekly patterns email sent to:", email);
    } else {
        console.error(
            "Failed to send weekly patterns email:",
            emailResult.error,
        );
    }
};

/**
 * Trigger and send progress check email
 */
const sendProgressCheck = async (
    userId: string,
    email: string,
    dryRun: boolean,
) => {
    console.log("\n--- Progress Check Email ---");

    // Generate progress insight
    const { createProgressInsight } = await import(
        "../lib/progress-insights/service"
    );

    console.log("Generating progress insight...");
    const result = await createProgressInsight(userId);

    if ("error" in result) {
        console.error("Failed to generate progress insight:", result.error);
        return;
    }

    console.log("Progress insight generated!");

    if (dryRun) {
        console.log("[DRY RUN] Would send progress check email to:", email);
        console.log("\nProgress insight content preview:");
        console.log(`${result.data.content.slice(0, 500)}...`);
        return;
    }

    // Extract headline
    const extractHeadline = (content: string): string => {
        const match = content.match(/THE HEADLINE[:\s]*\n+([^\n]+)/i);
        if (match?.[1]) {
            return match[1].replace(/^[#*>\s]+/, "").trim();
        }
        return "Your progress insight is ready";
    };

    // Send email
    const { sendProgressCheckEmail } = await import("../lib/email/service");

    const headline = extractHeadline(result.data.content);
    const emailResult = await sendProgressCheckEmail(
        email,
        email.split("@")[0],
        headline,
        15,
    );

    if (emailResult.success) {
        console.log("Progress check email sent to:", email);
    } else {
        console.error(
            "Failed to send progress check email:",
            emailResult.error,
        );
    }
};

/**
 * Main function
 */
const main = async () => {
    const { email, dryRun, clean, trialOnly, weeklyOnly, progressOnly } =
        parseArgs();
    const sendAll = !trialOnly && !weeklyOnly && !progressOnly;

    console.log("\n========================================");
    console.log("       Email Testing Script");
    console.log("========================================");
    console.log(`Email: ${email}`);
    console.log(`Dry run: ${dryRun}`);
    console.log(
        `Send: ${sendAll ? "all" : [trialOnly && "trial", weeklyOnly && "weekly", progressOnly && "progress"].filter(Boolean).join(", ")}`,
    );
    console.log("");

    // Clean if requested
    if (clean) {
        await cleanTestData();
    }

    // Create test user
    const userId = await ensureTestUser(email);
    console.log(`Test user created: ${userId}`);

    // Create entries
    const entries = await createEntries(userId);
    console.log(`Created ${entries.length} entries`);

    // Send emails
    if (sendAll || trialOnly) {
        await sendTrialReminder(email, dryRun);
    }

    if (sendAll || weeklyOnly) {
        await sendWeeklyPatterns(userId, email, entries, dryRun);
    }

    if (sendAll || progressOnly) {
        await sendProgressCheck(userId, email, dryRun);
    }

    console.log("\n========================================");
    console.log("              Complete!");
    console.log("========================================");
    console.log(`\nTest user ID: ${userId}`);
    console.log("Check your inbox for emails!");
    console.log("\nTo clean up test data:");
    console.log(`  npx tsx scripts/test-emails.ts ${email} --clean`);
};

main().catch(console.error);
