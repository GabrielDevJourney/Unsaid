/**
 * Smoke-test for prompt voice changes across all three AI tiers.
 * Calls AI functions directly — no DB, no server needed.
 *
 * Usage:
 *   npx tsx scripts/test-prompt-voice.ts           # all tiers
 *   npx tsx scripts/test-prompt-voice.ts --tier=1  # entry insight only
 *   npx tsx scripts/test-prompt-voice.ts --tier=2  # weekly patterns only
 *   npx tsx scripts/test-prompt-voice.ts --tier=3  # progress only
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const _uuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

// ─── Shared entry corpus ──────────────────────────────────────────────────────

const ENTRIES = [
    `Had another meeting where I just nodded along the whole time. My manager proposed a timeline that I know is unrealistic — we've shipped three sprints late in a row for the exact same reason — but when he asked the room I said nothing. I told myself I'd bring it up after. I didn't. Then I came home and couldn't stop thinking about how the project is going to blow up in four weeks and everyone's going to be surprised except me. I do this a lot. I see the problem clearly, I say nothing, then I spend all night anxious about it. I'm not even sure why I stay quiet. It's not like he'd fire me for disagreeing.`,

    `Couldn't sleep last night. Kept replaying that meeting where I volunteered to fix the deployment issue. It wasn't even my fault. But there I was, raising my hand like a good little soldier. I need to stop doing this.`,

    `Small win: I didn't immediately respond to Jake's 9pm Slack message about "a quick favor." Waited until morning. The world didn't end. He didn't even mention it. Maybe people care less than I think they do?`,

    `Feeling burnt out. Took a half day but spent most of it thinking about work anyway. What's the point of time off if my brain won't turn off? I need to figure out how to actually rest.`,

    `Noticed something today. When Mom called asking me to help my brother move AGAIN, I felt the familiar knot in my stomach. But this time I heard my own voice saying "I'm not available that weekend." Still said yes, but at least I noticed the hesitation. Progress?`,

    `Good conversation with Alex. They pointed out that I apologize constantly — even when nothing is my fault. Started counting today. Lost track after 20. That can't be normal, right?`,

    `The project deadline got moved up. Instead of asking for help, I'm planning to work through the weekend. Even as I type this I know it's wrong. But the thought of admitting I can't handle it feels worse than the exhaustion.`,

    `Weird realization: I'm more comfortable being overwhelmed than being seen as incapable. When did that happen? When did struggle become safer than asking for support?`,

    `Tried the "pause before responding" thing. Someone asked me to cover their shift. I said "let me check and get back to you." Didn't feel great — felt kind of rude actually — but I did it. Baby steps.`,

    `Exhausted but can't stop. There's always one more email, one more task, one more person who needs something. I wonder what would happen if I just... stopped. Would everything fall apart? Or would people figure it out?`,

    `Three months into this job and I've already become the "reliable one." The one people come to when they need something done. I used to think that was a compliment. Now I'm not so sure.`,

    `Today I set a boundary. A real one. Told my team lead I couldn't take on the documentation project. My voice shook but I did it. She said "okay, I'll ask someone else." That was it. No drama. No disappointment. Just... okay. I don't know what to do with this information.`,

    `Re-reading old entries and there's a pattern here. Every few weeks I write about being overwhelmed. Then I write about needing boundaries. Then nothing changes. Then I get overwhelmed again. It's like watching the same movie on repeat.`,

    `Had lunch with Sarah and she mentioned how she pushed back on her boss's request last week. Just casually, like it was nothing. I sat there nodding but inside I was thinking "how does she do that?"`,

    `Therapy session today. We talked about the boundary thing again. My therapist asked what I'm afraid will happen if I say no. I said people won't like me. She asked if that's ever actually happened. I couldn't think of an example. Interesting.`,
];

const div = (label: string) => {
    console.log(`\n${"─".repeat(60)}`);
    console.log(label);
    console.log("─".repeat(60));
};

// ─── Tier 1 — Entry insight ───────────────────────────────────────────────────

const testTier1 = async () => {
    console.log(
        "\n\n══════════════════════════════════════════════════════════",
    );
    console.log("TIER 1 — Entry Insight (Haiku 4.5)");
    console.log("══════════════════════════════════════════════════════════");

    const { streamEntryInsight } = await import(
        "../lib/ai/stream-entry-insight"
    );

    div("Entry (first one)");
    console.log(ENTRIES[0]);

    div("Generating...");
    const result = await streamEntryInsight(ENTRIES[0]);
    const text = await result.text;

    const parsed = JSON.parse(text) as { insight: string; tags: string[] };

    div("Insight");
    console.log(parsed.insight);
    console.log("\nTags:", parsed.tags.join(", "));

    console.log("\nVoice check:");
    console.log(
        "  - Opens with their words or concrete situation? (not 'It sounds like...')",
    );
    console.log("  - Direct and perceptive, warm but not validating?");
    console.log("  - Closing question points somewhere specific?");
    console.log("  - No generic advice (set boundaries, try meditation)?");
};

// ─── Tier 2 — Weekly patterns ─────────────────────────────────────────────────

const testTier2 = async () => {
    console.log(
        "\n\n══════════════════════════════════════════════════════════",
    );
    console.log("TIER 2 — Weekly Patterns (Sonnet 4.5)");
    console.log("══════════════════════════════════════════════════════════");

    const { generateWeeklyInsight } = await import(
        "../lib/ai/generate-weekly-insight"
    );

    const now = new Date();
    const entries = ENTRIES.slice(0, 7).map((content, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return { id: _uuid(), content, createdAt: date.toISOString() };
    });

    console.log(`\nAnalyzing ${entries.length} entries from the past week...`);

    const patterns = await generateWeeklyInsight(entries);

    if (patterns.length === 0) {
        console.log("\nNo patterns generated.");
        return;
    }

    for (const [i, p] of patterns.entries()) {
        div(`Pattern ${i + 1} — ${p.title}`);
        console.log(`Type:        ${p.pattern_type}`);
        console.log(`Description: ${p.description}`);
        console.log(`Question:    ${p.question}`);
        console.log(`Experiment:  ${p.suggested_experiment}`);
    }

    console.log("\nVoice check:");
    console.log(
        "  - Experiment is specific and named? (not 'reflect on this')",
    );
    console.log("  - Description references their words?");
    console.log("  - Question points to a specific tension?");
};

// ─── Tier 3 — Progress insight ────────────────────────────────────────────────

const testTier3 = async () => {
    console.log(
        "\n\n══════════════════════════════════════════════════════════",
    );
    console.log("TIER 3 — Progress Insight (Sonnet 4.5)");
    console.log("══════════════════════════════════════════════════════════");

    const { generateProgressInsight } = await import(
        "../lib/ai/generate-progress-insight"
    );

    const now = new Date();
    const recentEntries = ENTRIES.map((content, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (ENTRIES.length - 1 - i));
        return { id: _uuid(), content, createdAt: date.toISOString() };
    });

    console.log(`\nAnalyzing ${recentEntries.length} entries...`);

    const result = await generateProgressInsight({ recentEntries });

    if (!result) {
        console.log("\nFailed to generate progress insight.");
        return;
    }

    div("Progress Output");
    console.log(`Headline:        ${result.headline}`);
    console.log(`Whats on repeat: ${result.whats_on_repeat}`);
    console.log(`What changed:    ${result.what_changed}`);
    console.log(`Reality check:   ${result.reality_check}`);
    console.log(`Experiment:      ${result.experiment}`);
    console.log(`The question:    ${result.the_question}`);

    console.log("\nVoice check:");
    console.log(
        "  - Sounds like talking directly, not texting a friend or writing a report?",
    );
    console.log("  - Headline names the pattern directly?");
    console.log(
        "  - No fluff phrases ('It's worth noting', 'You might consider')?",
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
    const args = process.argv.slice(2);
    const tierArg = args.find((a) => a.startsWith("--tier="));
    const tier = tierArg ? parseInt(tierArg.split("=")[1], 10) : 0;

    if (tier === 0 || tier === 1) await testTier1();
    if (tier === 0 || tier === 2) await testTier2();
    if (tier === 0 || tier === 3) await testTier3();
};

main().catch(console.error);
