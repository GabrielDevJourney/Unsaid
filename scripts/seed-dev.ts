/**
 * Dev Seeder — zero AI cost
 *
 * Inserts N hardcoded entries + insights (cycles through the 15 templates),
 * a weekly insight, and seeds user_progress.
 *
 * Usage:
 *   npx tsx scripts/seed-dev.ts <clerk_user_id> [count] [email] [username]
 *
 * count defaults to 15. Pass any number — entries cycle through the 15 templates.
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

const ZERO_EMBEDDING = JSON.stringify(Array(1536).fill(0));

// 15 entries spread across the last 4 weeks
const ENTRIES = [
    {
        content:
            "Today was challenging at work. The deadline moved up again and I felt overwhelmed. But I managed to set a small boundary — I told my manager I needed to prioritize. It felt scary but also empowering.",
        tags: ["Boundaries", "Work"],
        insight:
            "You're learning that setting limits doesn't end relationships — it tests which ones are real. The fear before the boundary is always louder than the reality after it.",
        daysAgo: 28,
    },
    {
        content:
            "Had coffee with an old friend today. We talked about life changes and I realized how much I've been isolating myself. Connection feels good. I want to do this more often.",
        tags: ["Relationships", "Growth"],
        insight:
            "Isolation often disguises itself as independence. The fact that connection felt good tells you something important about where your energy is actually going.",
        daysAgo: 25,
    },
    {
        content:
            "Morning run today — first one in weeks. My body complained but my mind thanked me. There's something about physical movement that clears the mental fog. Going to try for twice this week.",
        tags: ["Health", "Growth"],
        insight:
            "You already know what works. The gap isn't knowledge — it's permission. You gave yourself permission today. That's the only thing that changed.",
        daysAgo: 23,
    },
    {
        content:
            "Said yes to another project at work. I don't know why I keep doing this. I'm already stretched thin. By the time I got home I felt resentful — at them, at myself. I wrote 'I need to stop saying yes' in my journal three times last month.",
        tags: ["Boundaries", "Work"],
        insight:
            "Repeating the insight without changing the behavior is a sign the cost of the old pattern still feels lower than the discomfort of the new one. What would actually have to happen for the cost to flip?",
        daysAgo: 21,
    },
    {
        content:
            "Skipped the gym again. I had a plan and didn't follow it. I'm not even that tired — I think I'm just avoiding something. The apartment feels smaller lately. Not sure what's going on underneath this.",
        tags: ["Health", "Anxiety"],
        insight:
            "Avoidance is always about the feeling, not the task. The gym isn't the thing you're avoiding — something the gym requires of you is.",
        daysAgo: 19,
    },
    {
        content:
            "Had a good call with my sister. She asked how I was actually doing and I gave her a real answer instead of 'fine.' It felt vulnerable and also lighter afterward. I hadn't realized how heavy I was making everything by carrying it alone.",
        tags: ["Relationships", "Vulnerability"],
        insight:
            "The weight wasn't the situation — it was the secrecy. You just discovered that honesty is one of the few loads that gets lighter the moment you share it.",
        daysAgo: 17,
    },
    {
        content:
            "Work meeting where I almost spoke up but didn't. The moment passed and then I felt frustrated at myself for the rest of the day. Why do I keep silencing myself? I had something real to say.",
        tags: ["Boundaries", "Work"],
        insight:
            "The frustration after silence is useful information. It tells you the cost of staying quiet is rising. That shift is what eventually makes speaking up feel necessary rather than optional.",
        daysAgo: 15,
    },
    {
        content:
            "Two runs this week. Proud of that. Also had a hard conversation with my manager — told him the workload wasn't sustainable. He actually listened. I was prepared for the worst and got something closer to respect.",
        tags: ["Boundaries", "Health"],
        insight:
            "You're collecting evidence against the catastrophic predictions. The boundary didn't destroy the relationship. The run happened twice, not once. Your track record this week is better than your fears would have predicted.",
        daysAgo: 13,
    },
    {
        content:
            "Spent the evening doing nothing useful. Just sat with the discomfort instead of filling it with productivity. I'm not sure if that's growth or avoidance. Maybe both. Either way I survived it.",
        tags: ["Anxiety", "Growth"],
        insight:
            "Tolerating emptiness without flinching is a skill most people never develop. The fact that you can sit with discomfort and call it curious rather than wrong is itself the thing you were working toward.",
        daysAgo: 11,
    },
    {
        content:
            "Reached out to someone I haven't talked to in two years. Old friction I never resolved. They responded warmly. We're meeting next week. I've been avoiding this and I'm not sure why I waited so long.",
        tags: ["Relationships", "Vulnerability"],
        insight:
            "The story you were protecting yourself from — the one where reaching out goes badly — didn't survive contact with reality. This is a pattern worth tracking.",
        daysAgo: 9,
    },
    {
        content:
            "Felt genuinely overwhelmed today. Cried in the car for twenty minutes. Then somehow showed up to the meeting and did fine. The gap between how I feel and what I'm capable of doing keeps surprising me.",
        tags: ["Anxiety", "Growth"],
        insight:
            "You're discovering that your capacity and your emotional state are two different things. Most people confuse them. You're learning not to. That's a significant distinction.",
        daysAgo: 7,
    },
    {
        content:
            "Another yes when I meant to say no. The pattern is embarrassingly consistent at this point. I can see it happening in slow motion and still don't stop it. It's like watching yourself walk into a glass door you've walked into before.",
        tags: ["Boundaries", "Work"],
        insight:
            "Seeing the pattern clearly and still repeating it is actually progress — not because it's comfortable, but because the moment of awareness is getting earlier each time. The pause before the yes is the thing to watch.",
        daysAgo: 5,
    },
    {
        content:
            "Three runs this week. I didn't think about whether to do them — I just went. Something shifted. The decision fatigue is gone, at least for this one thing. I want to understand how that happened so I can apply it elsewhere.",
        tags: ["Health", "Growth"],
        insight:
            "The habit formed when you stopped negotiating with yourself. You applied that to one area; the question now is what negotiation you're still having with yourself in others.",
        daysAgo: 3,
    },
    {
        content:
            "Good conversation tonight. I was honest about something I usually keep private — a fear I have about my career direction. Nobody ran away. I'm starting to think the version of myself I hide is more interesting than the one I perform.",
        tags: ["Vulnerability", "Growth"],
        insight:
            "The version you hide isn't the weak one — it's the one with stakes. The performed version is safe because it has nothing to lose. The real one is the one that can actually connect.",
        daysAgo: 2,
    },
    {
        content:
            "Wrapped up the week feeling like something has shifted, even if I can't name it precisely. I still said yes when I meant no once. But there's less shame about it now. More curiosity about what the yes is protecting me from.",
        tags: ["Boundaries", "Growth"],
        insight:
            "Shifting from shame to curiosity about a pattern is the actual turning point — not fixing the pattern. You can't think your way out of a behavior you haven't fully understood yet.",
        daysAgo: 1,
    },
];

const userId = process.argv[2];
if (!userId) {
    console.error(
        "Usage: npx tsx scripts/seed-dev.ts <clerk_user_id> [email] [username]",
    );
    process.exit(1);
}

const countArg = Number.parseInt(process.argv[3] ?? "15", 10);
const _count = Number.isNaN(countArg) || countArg < 1 ? 15 : countArg;
const _userEmail = process.argv[4] ?? `dev+${userId.slice(-8)}@unsaid.dev`;
const _userName = process.argv[5] ?? `devuser_${userId.slice(-6)}`;

const log = (msg: string) => console.log(msg);

const main = async () => {
    const { encrypt } = await import("../lib/crypto");

    log(`\n🌱 Seeding dev data for user: ${userId}\n`);

    // 0. Ensure users row exists
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

    // 1. Insert N entries + insights (cycles through ENTRIES templates)
    const entryIds: string[] = [];

    for (let i = 0; i < _count; i++) {
        const { content, tags, insight, daysAgo } = ENTRIES[i % ENTRIES.length];

        const { encryptedContent, iv, tag } = encrypt(content);

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        createdAt.setHours(9 + i, 0, 0, 0);

        const { data: entryRow, error: entryError } = await supabase
            .from("entries")
            .insert({
                user_id: userId,
                encrypted_content: encryptedContent,
                content_iv: iv,
                content_tag: tag,
                word_count: content.split(" ").length,
                embedding: ZERO_EMBEDDING,
                created_at: createdAt.toISOString(),
            })
            .select("id")
            .single();

        if (entryError || !entryRow) {
            console.error(`  ❌ Entry ${i + 1} failed:`, entryError?.message);
            process.exit(1);
        }

        entryIds.push(entryRow.id);
        log(
            `  ✅ Entry ${i + 1} (${daysAgo}d ago): ${entryRow.id.slice(0, 8)}...`,
        );

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
            log(`     ↳ insight + tags [${tags.join(", ")}]`);
        }
    }

    // 2. Weekly insight + patterns (covering the last week's entries)
    const recentIds = entryIds.slice(-5);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const { data: weeklyRow } = await supabase
        .from("weekly_insights")
        .insert({
            user_id: userId,
            week_start: weekStart.toISOString(),
            entry_ids: recentIds,
        })
        .select("id")
        .single();

    if (weeklyRow) {
        log(`\n  ✅ Weekly insight: ${weeklyRow.id.slice(0, 8)}...`);

        const patternData = [
            {
                title: "Boundaries as self-respect",
                description:
                    "You mention feeling scared before asserting yourself, then relieved after. The gap between fear and reality is shrinking — you're learning that setting limits protects relationships rather than ending them.",
                pattern_type: "behavioral-loop",
            },
            {
                title: "Avoidance disguised as rest",
                description:
                    "Across multiple entries you describe skipping commitments to yourself (gym, boundaries) while attributing it to tiredness. But when examined, the pattern reveals avoidance of the emotional cost of showing up — not physical fatigue.",
                pattern_type: "cognitive-distortion",
            },
        ];

        for (const p of patternData) {
            const encDesc = encrypt(p.description);
            await supabase.from("weekly_insight_patterns").insert({
                weekly_insight_id: weeklyRow.id,
                title: p.title,
                pattern_type: p.pattern_type,
                encrypted_description: encDesc.encryptedContent,
                description_iv: encDesc.iv,
                description_tag: encDesc.tag,
                evidence: recentIds.slice(0, 2),
                is_viewed: false,
            });
            log(`     ↳ pattern: "${p.title}"`);
        }
    }

    // 3. Upsert user_progress (creates if missing, updates if exists)
    await supabase.from("user_progress").upsert(
        {
            user_id: userId,
            total_entries: _count,
            entry_count_at_last_progress: 0,
        },
        { onConflict: "user_id" },
    );

    log(`\n  ✅ user_progress → total_entries=${_count}, last_progress=0`);
    log(`\n✅ Done. ${_count} entries seeded. Ready for forceGenerate.\n`);
};

main().catch((err) => {
    console.error("Seeder failed:", err);
    process.exit(1);
});
