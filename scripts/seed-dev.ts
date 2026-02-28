/**
 * Dev Seeder — zero AI cost
 *
 * Inserts hardcoded entries, insights, weekly insight, and progress insight
 * for a given user. Uses real encryption. No AI API calls.
 *
 * Usage:
 *   npx tsx scripts/seed-dev.ts <clerk_user_id> [email] [username]
 *
 * email and username default to dev placeholders if omitted.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Must run before any lib imports that read process.env at module load time
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Zero vector — avoids OpenAI call, still valid for pgvector column
const ZERO_EMBEDDING = JSON.stringify(Array(1536).fill(0));

const ENTRIES = [
    {
        content:
            "Today was challenging at work. The deadline moved up again and I felt overwhelmed. But I managed to set a small boundary — I told my manager I needed to prioritize. It felt scary but also empowering.",
        wordCount: 38,
        insight:
            "You're learning that setting limits doesn't end relationships — it tests which ones are real. The fear before the boundary is always louder than the reality after it.",
        tags: ["Boundaries", "Work"],
    },
    {
        content:
            "Had coffee with an old friend today. We talked about life changes and I realized how much I've been isolating myself. Connection feels good. I want to do this more often.",
        wordCount: 33,
        insight:
            "Isolation often disguises itself as independence. The fact that connection felt good — not draining — tells you something important about where your energy is actually going.",
        tags: ["Relationships", "Goals"],
    },
    {
        content:
            "Morning run today — first one in weeks. My body complained but my mind thanked me. There's something about physical movement that clears the mental fog. Going to try for twice this week.",
        wordCount: 34,
        insight:
            "You already know what works. The gap isn't knowledge — it's permission. You gave yourself permission today. That's the only thing that changed.",
        tags: ["Health", "Growth"],
    },
];

const userId = process.argv[2];
if (!userId) {
    console.error(
        "Usage: npx tsx scripts/seed-dev.ts <clerk_user_id> [email] [username]",
    );
    process.exit(1);
}

const _userEmail = process.argv[3] ?? `dev+${userId.slice(-8)}@unsaid.dev`;
const _userName = process.argv[4] ?? `devuser_${userId.slice(-6)}`;

const log = (msg: string) => console.log(msg);

const main = async () => {
    const { encrypt } = await import("../lib/crypto");

    log(`\n🌱 Seeding dev data for user: ${userId}\n`);

    // 0. Ensure users row exists (FK required by entries + other tables)
    const { data: existingUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    if (!existingUser) {
        const { error: userError } = await supabase.from("users").insert({
            user_id: userId,
            email: _userEmail,
            username: _userName,
        });
        if (userError) {
            console.error("  ❌ users row failed:", userError.message);
            process.exit(1);
        }
        log("  ✅ users row created");

        await supabase
            .from("subscriptions")
            .insert({ user_id: userId, status: "active" });
        log("  ✅ subscriptions row created");

        await supabase.from("user_progress").insert({
            user_id: userId,
            total_entries: 0,
            entry_count_at_last_progress: 0,
        });
        log("  ✅ user_progress row created");
    } else {
        log(`  ✅ User already exists: ${userId.slice(0, 12)}...`);
    }

    // 2. Insert entries + insights
    const entryIds: string[] = [];

    for (let i = 0; i < ENTRIES.length; i++) {
        const { content, wordCount, insight, tags } = ENTRIES[i];

        const { encryptedContent, iv, tag } = encrypt(content);

        const { data: entryRow, error: entryError } = await supabase
            .from("entries")
            .insert({
                user_id: userId,
                encrypted_content: encryptedContent,
                content_iv: iv,
                content_tag: tag,
                word_count: wordCount,
                embedding: ZERO_EMBEDDING,
            })
            .select("id")
            .single();

        if (entryError || !entryRow) {
            console.error(`  ❌ Entry ${i + 1} failed:`, entryError?.message);
            process.exit(1);
        }

        entryIds.push(entryRow.id);
        log(`  ✅ Entry ${i + 1} created: ${entryRow.id.slice(0, 8)}...`);

        const encInsight = encrypt(insight);

        const { error: insightError } = await supabase
            .from("entry_insights")
            .upsert(
                {
                    user_id: userId,
                    entry_id: entryRow.id,
                    encrypted_content: encInsight.encryptedContent,
                    content_iv: encInsight.iv,
                    content_tag: encInsight.tag,
                    tags,
                    insight_count: 1,
                },
                { onConflict: "entry_id" },
            );

        if (insightError) {
            console.error(
                `  ❌ Insight ${i + 1} failed:`,
                insightError.message,
            );
        } else {
            log(`  ✅ Insight ${i + 1} created`);
        }
    }

    // 3. Weekly insight + patterns
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { data: weeklyRow, error: weeklyError } = await supabase
        .from("weekly_insights")
        .insert({
            user_id: userId,
            week_start: weekStart.toISOString(),
            entry_ids: entryIds,
        })
        .select("id")
        .single();

    if (weeklyError || !weeklyRow) {
        console.error("  ❌ Weekly insight failed:", weeklyError?.message);
    } else {
        log(`  ✅ Weekly insight created: ${weeklyRow.id.slice(0, 8)}...`);

        const patterns = [
            {
                weekly_insight_id: weeklyRow.id,
                user_id: userId,
                title: "Boundaries as self-respect",
                description:
                    "You mention feeling scared before asserting yourself, then relieved after. This gap between fear and reality is shrinking — you're learning that setting limits protects relationships rather than ending them.",
                pattern_type: "behavioral-loop",
                supporting_entry_ids: [entryIds[0]],
            },
            {
                weekly_insight_id: weeklyRow.id,
                user_id: userId,
                title: "Isolation masking independence",
                description:
                    "You've noted the contrast between expected effort and actual experience twice this week — connection felt easier than anticipated, movement felt better than feared. Your predictions about discomfort are consistently worse than reality.",
                pattern_type: "cognitive-distortion",
                supporting_entry_ids: [entryIds[1], entryIds[2]],
            },
        ];

        const { error: patternsError } = await supabase
            .from("weekly_insight_patterns")
            .insert(patterns);

        if (patternsError) {
            console.error("  ❌ Patterns failed:", patternsError.message);
        } else {
            log(`  ✅ ${patterns.length} patterns created`);
        }
    }

    // 4. Progress insight
    const progressContent =
        "THE HEADLINE: You know what works. You're just not doing it consistently yet.\n\n" +
        "WHAT'S ON REPEAT: 'I felt overwhelmed' (2 entries). 'I want to do this more often' (2 entries).\n\n" +
        "WHAT CHANGED: You set a boundary at work and followed through. You initiated connection instead of waiting.\n\n" +
        "THE REALITY CHECK: Awareness is the easy part. You're now in the harder phase — making the behavior automatic.\n\n" +
        "EXPERIMENT: Pick one thing you said 'I want to do more' and schedule it before Friday.\n\n" +
        "THE QUESTION: What would change if you trusted your own follow-through the way you trusted it this week?";

    const encProgress = encrypt(progressContent);

    const { error: progressError } = await supabase
        .from("progress_insights")
        .insert({
            user_id: userId,
            encrypted_content: encProgress.encryptedContent,
            content_iv: encProgress.iv,
            content_tag: encProgress.tag,
            entry_count: ENTRIES.length,
            entry_ids: entryIds,
        });

    if (progressError) {
        console.error("  ❌ Progress insight failed:", progressError.message);
    } else {
        log("  ✅ Progress insight created");
    }

    // 5. Update user_progress
    await supabase
        .from("user_progress")
        .update({
            total_entries: ENTRIES.length,
            entry_count_at_last_progress: ENTRIES.length,
        })
        .eq("user_id", userId);

    log("  ✅ user_progress updated");

    log(
        `\n✅ Done. ${ENTRIES.length} entries, insights, weekly + progress data seeded.\n`,
    );
};

main().catch((err) => {
    console.error("Seeder failed:", err);
    process.exit(1);
});
