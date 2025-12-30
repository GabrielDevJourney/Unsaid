/**
 * Seeder script to test progress insights feature.
 *
 * Creates test entries for a user to trigger progress insight generation.
 * Includes realistic journal content with recurring themes for pattern detection.
 *
 * Usage:
 *   npx tsx scripts/seed-progress-test.ts <user_id> [options]
 *
 * Options:
 *   --entries=N     Number of recent entries to create (default: 15)
 *   --past=N        Number of older entries for semantic search (default: 5)
 *   --trigger       Auto-trigger progress insight after seeding
 *   --clean         Delete existing test entries before seeding
 *
 * Examples:
 *   npx tsx scripts/seed-progress-test.ts user_abc123
 *   npx tsx scripts/seed-progress-test.ts user_abc123 --entries=20 --trigger
 *   npx tsx scripts/seed-progress-test.ts user_abc123 --clean --trigger
 */

import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embed } from "ai";

// Load env manually since this runs outside Next.js
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Realistic journal entries with recurring themes (boundaries, work stress, self-worth)
const RECENT_ENTRIES = [
    `Today was rough. My manager asked me to take on another project and I said yes even though I'm already drowning. Why can't I just say no? I keep telling myself I'll set boundaries but then the moment comes and I fold. The worst part is I know exactly what's happening while it's happening.`,

    `Had lunch with Sarah and she mentioned how she pushed back on her boss's request last week. Just casually, like it was nothing. I sat there nodding but inside I was thinking "how does she do that?" Is there some gene I'm missing?`,

    `Couldn't sleep last night. Kept replaying that meeting where I volunteered to fix the deployment issue. It wasn't even my fault. But there I was, raising my hand like a good little soldier. I need to stop doing this.`,

    `Therapy session today. We talked about the boundary thing again. Dr. Martinez asked what I'm afraid will happen if I say no. I said people won't like me. She asked if that's ever actually happened. I couldn't think of an example. Interesting.`,

    `Small win: I didn't immediately respond to Jake's 9pm Slack message about "a quick favor." Waited until morning. The world didn't end. He didn't even mention it. Maybe people care less than I think they do?`,

    `Feeling burnt out. Took a half day but spent most of it thinking about work anyway. What's the point of time off if my brain won't turn off? I need to figure out how to actually rest.`,

    `Noticed something today. When Mom called asking me to help my brother move AGAIN, I felt the familiar knot in my stomach. But this time I heard my own voice saying "I'm not available that weekend." Still said yes, but at least I noticed the hesitation. Progress?`,

    `Re-reading old entries and there's a pattern here. Every few weeks I write about being overwhelmed. Then I write about needing boundaries. Then nothing changes. Then I get overwhelmed again. It's like watching the same movie on repeat.`,

    `Good conversation with Alex. They pointed out that I apologize constantly—even when nothing is my fault. Started counting today. Lost track after 20. That can't be normal, right?`,

    `The project deadline got moved up. Instead of asking for help, I'm planning to work through the weekend. Even as I type this I know it's wrong. But the thought of admitting I can't handle it feels worse than the exhaustion.`,

    `Weird realization: I'm more comfortable being overwhelmed than being seen as incapable. When did that happen? When did struggle become safer than asking for support?`,

    `Tried the "pause before responding" thing Dr. Martinez suggested. Someone asked me to cover their shift. I said "let me check and get back to you." Didn't feel great—felt kind of rude actually—but I did it. Baby steps.`,

    `Exhausted but can't stop. There's always one more email, one more task, one more person who needs something. I wonder what would happen if I just... stopped. Would everything fall apart? Or would people figure it out?`,

    `Three months into this job and I've already become the "reliable one." The one people come to when they need something done. I used to think that was a compliment. Now I'm not so sure.`,

    `Today I set a boundary. A real one. Told my team lead I couldn't take on the documentation project. My voice shook but I did it. She said "okay, I'll ask someone else." That was it. No drama. No disappointment. Just... okay. I don't know what to do with this information.`,
];

// Older entries with similar themes (for semantic search to find)
const PAST_ENTRIES = [
    `Started the new job last month and I already feel like I'm proving myself constantly. Stayed late every day this week even though no one asked me to. I just have this voice in my head saying I need to show them I'm worth hiring.`,

    `Mom called again about the family dinner. I really didn't want to go but of course I said yes. Three hours of pretending everything is fine while everyone talks over each other. Why do I keep doing this to myself?`,

    `Burned out at my last job because I couldn't say no. Promised myself this time would be different. It's only week two and I already see the same patterns forming. What is wrong with me?`,

    `Had a panic attack at work today. Locked myself in the bathroom for 20 minutes. No one noticed I was gone. That tells me something about how essential I actually am, versus how essential I feel I need to be.`,

    `Reading about people-pleasing and it's like reading my biography. The fear of disappointing others. The compulsive agreeing. The resentment that builds up. I didn't know there was a name for this.`,

    `Tried to take a vacation day but ended up checking emails the whole time. My partner was frustrated. I was frustrated at myself. I don't know how to just... be. There's always this voice saying I should be doing more.`,

    `Realized I've never once asked for a raise. In ten years of working. Everyone around me negotiates, asks for what they want. I just take what's offered and feel grateful. Is gratitude holding me back?`,
];

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
 * Parse command line arguments
 */
const parseArgs = () => {
    const args = process.argv.slice(2);
    const userId = args.find((arg) => !arg.startsWith("--"));

    if (!userId) {
        console.error(
            "Usage: npx tsx scripts/seed-progress-test.ts <user_id> [options]",
        );
        console.error("\nOptions:");
        console.error(
            "  --entries=N     Number of recent entries (default: 15)",
        );
        console.error("  --past=N        Number of past entries (default: 5)");
        console.error("  --trigger       Auto-trigger progress insight");
        console.error("  --clean         Delete existing entries first");
        process.exit(1);
    }

    const getNumericArg = (name: string, defaultVal: number): number => {
        const arg = args.find((a) => a.startsWith(`--${name}=`));
        if (arg) {
            const val = parseInt(arg.split("=")[1], 10);
            return Number.isNaN(val) ? defaultVal : val;
        }
        return defaultVal;
    };

    return {
        userId,
        entryCount: getNumericArg("entries", 15),
        pastCount: getNumericArg("past", 5),
        shouldTrigger: args.includes("--trigger"),
        shouldClean: args.includes("--clean"),
    };
};

/**
 * Ensure user exists in database
 */
const ensureUserExists = async (userId: string) => {
    const { data: user } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    if (!user) {
        console.log(`Creating user record for ${userId}...`);
        const { error } = await supabase.from("users").insert({
            user_id: userId,
            email: `${userId}@test.local`,
        });
        if (error) {
            console.error("Failed to create user:", error);
            process.exit(1);
        }
    }
};

/**
 * Clean existing test entries
 */
const cleanEntries = async (userId: string) => {
    console.log("Cleaning existing entries...");

    const { error: entriesError } = await supabase
        .from("entries")
        .delete()
        .eq("user_id", userId);

    if (entriesError) {
        console.error("Failed to clean entries:", entriesError);
    }

    const { error: progressError } = await supabase
        .from("progress_insights")
        .delete()
        .eq("user_id", userId);

    if (progressError) {
        console.error("Failed to clean progress insights:", progressError);
    }

    // Reset user progress
    await supabase.from("user_progress").upsert({
        user_id: userId,
        total_entries: 0,
        entry_count_at_last_progress: 0,
    });

    console.log("Cleaned existing data.");
};

/**
 * Create entries with staggered dates
 */
const createEntries = async (
    userId: string,
    entries: string[],
    startDaysAgo: number,
) => {
    const results = [];

    for (let i = 0; i < entries.length; i++) {
        const content = entries[i];
        const wordCount = content.split(/\s+/).length;

        // Stagger dates (oldest first)
        const date = new Date();
        date.setDate(date.getDate() - startDaysAgo + i);
        date.setHours(10 + (i % 12), Math.floor(Math.random() * 60), 0, 0);

        console.log(`Creating entry ${i + 1}/${entries.length}...`);

        // Generate embedding
        const embedding = await generateEmbedding(content);

        const { data, error } = await supabase
            .from("entries")
            .insert({
                user_id: userId,
                content,
                word_count: wordCount,
                embedding,
                created_at: date.toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error(`Failed to create entry ${i + 1}:`, error);
        } else {
            results.push(data);
        }

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return results;
};

/**
 * Update user progress count
 */
const updateUserProgress = async (userId: string, totalEntries: number) => {
    const { error } = await supabase.from("user_progress").upsert({
        user_id: userId,
        total_entries: totalEntries,
        entry_count_at_last_progress: 0, // Reset so trigger will fire
    });

    if (error) {
        console.error("Failed to update user progress:", error);
    }
};

/**
 * Trigger progress insight generation via API
 */
const triggerProgressInsight = async (userId: string) => {
    console.log("\nTriggering progress insight generation...");

    // Import the service directly since we're in a script
    const { createProgressInsight } = await import(
        "../lib/progress-insights/service"
    );

    const result = await createProgressInsight(userId);

    if ("error" in result) {
        console.error("Failed to generate progress insight:", result.error);
        return null;
    }

    return result.data;
};

/**
 * Main seeder function
 */
const main = async () => {
    const { userId, entryCount, pastCount, shouldTrigger, shouldClean } =
        parseArgs();

    console.log("\n🌱 Progress Insights Test Seeder");
    console.log("================================");
    console.log(`User ID: ${userId}`);
    console.log(`Recent entries: ${entryCount}`);
    console.log(`Past entries: ${pastCount}`);
    console.log(`Auto-trigger: ${shouldTrigger}`);
    console.log(`Clean first: ${shouldClean}`);
    console.log("");

    // Ensure user exists
    await ensureUserExists(userId);

    // Clean if requested
    if (shouldClean) {
        await cleanEntries(userId);
    }

    // Create past entries (60+ days ago for clear separation)
    if (pastCount > 0) {
        console.log(`\nCreating ${pastCount} past entries (60+ days ago)...`);
        const pastToCreate = PAST_ENTRIES.slice(0, pastCount);
        await createEntries(userId, pastToCreate, 60 + pastCount);
    }

    // Create recent entries (within last 30 days)
    console.log(`\nCreating ${entryCount} recent entries...`);
    const recentToCreate = RECENT_ENTRIES.slice(0, entryCount);

    // If we need more than we have, cycle through
    while (recentToCreate.length < entryCount) {
        const idx = recentToCreate.length % RECENT_ENTRIES.length;
        recentToCreate.push(
            `${RECENT_ENTRIES[idx]} (Entry variation ${recentToCreate.length + 1})`,
        );
    }

    await createEntries(userId, recentToCreate, entryCount);

    // Update user progress
    const totalEntries = entryCount + pastCount;
    await updateUserProgress(userId, totalEntries);
    console.log(`\nUpdated user_progress: ${totalEntries} total entries`);

    // Trigger if requested
    if (shouldTrigger) {
        const insight = await triggerProgressInsight(userId);
        if (insight) {
            console.log("\n✅ Progress insight generated!");

            // Show metadata
            console.log("\n📊 Response metadata:");
            console.log(`  id: ${insight.id}`);
            console.log(`  user_id: ${insight.user_id}`);
            console.log(
                `  recent_entry_ids: [${insight.recent_entry_ids.length} entries]`,
            );
            console.log(
                `  related_past_entry_ids: [${insight.related_past_entry_ids?.length ?? 0} entries]`,
            );
            console.log(`  created_at: ${insight.created_at}`);

            // Show content
            console.log("\n📝 Content:");
            console.log("---");
            console.log(insight.content);
            console.log("---");

            // Show full JSON for API reference
            console.log("\n🔧 Full API response (JSON):");
            console.log(JSON.stringify(insight, null, 2));
        }
    }

    console.log("\n✅ Seeding complete!");
    console.log("\nNext steps:");
    if (!shouldTrigger) {
        console.log(
            "  1. Trigger manually: POST /api/insights/progress/generate",
        );
    }
    console.log("  2. View insights: GET /api/insights/progress");
    console.log("  3. Check status: GET /api/insights/progress/generate");
};

main().catch(console.error);
