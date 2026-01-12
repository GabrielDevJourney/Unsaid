/**
 * Heavy User Monthly Usage Seeder
 *
 * Simulates a full month of heavy app usage to stress-test the backend.
 *
 * Creates:
 * - 90 entries (3 per day × 30 days, ~2000 words each)
 * - 90 entry insights (Tier 1)
 * - 4 weekly insights with patterns (Tier 2)
 * - 6 progress insights (Tier 3, every 15 entries)
 *
 * Usage:
 *   npx tsx scripts/seed-monthly-usage.ts <user_id> [options]
 *
 * Options:
 *   --clean         Delete existing data before seeding
 *   --skip-insights Skip AI insight generation (entries only)
 *   --dry-run       Show plan without DB writes
 */

import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embed } from "ai";
import { config } from "dotenv";

// Load env before anything else
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

/**
 * Generate embedding for content (inline to avoid import issues)
 */
const generateEmbedding = async (content: string): Promise<string> => {
    const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
    });
    return JSON.stringify(embedding);
};

// Configuration
const DAYS = 30;
const ENTRIES_PER_DAY = 3;
const TOTAL_ENTRIES = DAYS * ENTRIES_PER_DAY; // 90
const PROGRESS_INTERVAL = 15;

// Long-form journal entries (~2000 words each) - 10 base entries, varied for 90 total
const BASE_ENTRIES = [
    // Work stress and boundaries
    `I've been sitting here for twenty minutes staring at my laptop, watching the cursor blink. Another day, another mountain of tasks multiplying faster than I can complete them. The project deadline got moved up again—third time this month—and I found myself nodding along as if it were perfectly reasonable. It wasn't.

My manager presented it as an "opportunity to demonstrate commitment," but what I heard was "sacrifice your evenings because someone made promises without consulting us." I should have said something. I should have pointed out we're stretched thin, that quality will suffer.

But I didn't. I sat in silence, like everyone else.

There's this familiar knot in my stomach that's been my constant companion for weeks. It tightens every Sunday evening, loosens slightly Friday afternoons, never fully goes away. I used to think this was normal—the price of having a good job. But lately I wonder if I've confused "normal" with "normalized."

Sarah mentioned during lunch she started seeing a therapist for work anxiety. She said it so casually, and I found myself both envious and inspired. Envious because she's doing something about it.

I keep thinking about what Dr. Peterson said in that podcast—about avoiding short-term discomfort at the cost of long-term suffering. That's exactly what I'm doing. Avoiding speaking up, setting boundaries, potentially disappointing people, while accumulating massive debt of stress and resentment.

The thing that bothers me most is I know better. I've read the books. I've listened to the podcasts. I could give a compelling presentation on work-life balance and still stay at the office until 8pm because I couldn't say no.

Tomorrow I have a one-on-one with my manager. I've been thinking about bringing up the workload issue, but every time I imagine it, my mind goes blank. What if she thinks I'm not dedicated? What if this affects my review?

But what if I don't say anything and nothing changes?

I need to remember that setting a boundary isn't confrontation. It's information. I'm not attacking anyone by saying "I can take this on, but something else needs to be deprioritized." That's just math.

Maybe I'll start small. Instead of agreeing immediately to every request, I'll say "let me check and get back to you." That's not saying no. That's just pausing.

The cursor is still blinking. I should close this laptop and go to bed. Tomorrow is another day, another chance to do things differently. Or at least slightly less the same.

Note to self: You are not a machine. You cannot optimize your way to happiness. Sometimes the most productive thing you can do is rest.`,

    // Relationship reflections
    `Had a long conversation with Marcus last night that left me feeling... I'm not even sure what. Hopeful? Scared? Both, probably. We've been together three years now, and lately there's this unspoken tension hanging over everything.

He finally asked about the future. Not dramatically, just quietly while we were doing dishes. "Where do you see us in five years?" Simple question, but I felt my heart rate spike.

The honest answer is: I don't know. And that feels terrifying to admit. I love him. I'm fairly certain of that. He's kind, makes me laugh, remembers the small things, shows up when it matters. On paper, he's everything I said I wanted.

But there's this nagging doubt I can't shake. Is this just comfortable? Is comfortable the same as right? My parents were together thirty years before quietly divorcing. Mom said she'd been unhappy for at least the last ten. She stayed because leaving seemed harder than staying.

I don't want that. I don't want to wake up at fifty-five realizing I've been going through the motions for decades.

Marcus deserves honesty. He deserves someone who's all in. I think I could be that person—I want to be—but first I need to understand why I'm hesitating.

My therapist would probably say this relates to fear of commitment, which relates to fear of vulnerability, which relates to... everything. She has this theory that I've built walls so carefully I've forgotten they're walls. They just feel like who I am.

But walls can come down. Slowly, carefully, brick by brick.

The real question isn't whether I'm scared. The real question is whether I'm willing to be scared and stay anyway. To choose this person, this vulnerability, not because it's comfortable but because it's worth it.

I told Marcus I needed time to think. He said okay, gave me a hug, went to bed. No drama. Just patience. Somehow that made me feel worse, because he's giving me exactly the space I asked for.

Tomorrow I'm going to call Sarah. She went through something similar before she and her husband tried couples counseling.

For now, I'm just going to sit with the uncertainty. Not trying to solve it. Just being in it. Apparently that's growth.`,

    // Health and self-care
    `Went for my first run in three months today. I use "run" generously—more like a shambling jog interrupted by walking breaks and one extended pause where I bent over questioning every life choice.

But I did it. I put on the running shoes gathering dust in the closet, left the apartment, moved my body forward faster than walking speed. That counts.

The interesting thing is I didn't hate it as much as expected. Once past the first ten minutes of my lungs screaming, there was this brief window—maybe five minutes—where everything felt almost good. My thoughts got quieter. The endless loop of worries and to-do lists faded.

I've been trying to understand why I stopped exercising. It wasn't a conscious decision. No moment where I thought "I'm done with this forever." More like gradual erosion. One skipped workout became two, became a week, became "I'll start Monday," became three months.

Part of it was depression. When struggling to get out of bed, voluntarily making yourself uncomfortable sounds absurd. Exercise advice always comes from people already feeling fine.

But part was also inertia. Objects at rest tend to stay at rest. Once I'd established the pattern of not exercising, breaking it required more activation energy than I had.

Until today. Not sure what changed. Maybe seeing that photo from five years ago and not recognizing myself. Maybe accepting that body and mind are connected—you can't neglect one without affecting the other.

I'm trying not to make it into a whole thing. Not signing up for a marathon or telling everyone I'm "really committed to fitness this time." I've done that before. The bigger the announcement, the bigger the disappointment.

Instead, I'm aiming for small. Embarrassingly small. Run once this week. That's it. If I do it, next week maybe twice. Baby steps. Sustainable steps.

My knees hurt and I'll be sore tomorrow. But for the first time in a while, I feel like I did something for myself. Not for productivity, not for appearances. Just because some part of me remembers what it feels like to be alive.

That's worth something. Maybe everything.`,

    // Anxiety and coping
    `The anxiety was bad today. Sitting-in-my-car-for-fifteen-minutes-before-the-grocery-store bad. Heart-racing-at-2am-for-no-reason bad. Every small decision feeling like it might ruin everything bad.

I keep trying to trace it to a cause, as if identifying the trigger would defuse the bomb. But anxiety doesn't work like that for me. It's not always a reasonable response to a specific threat. Sometimes it's just weather. A storm system moving through my nervous system.

The hardest part is that I know, intellectually, it will pass. Years of evidence proving no anxiety attack has lasted forever. I've survived every single one. This feeling is temporary even when it feels eternal. But that knowledge doesn't make it easier in the moment.

What helped today was texting Jamie. Not for advice—I've learned asking anxious me for solutions is like asking someone drowning to navigate the boat. I just said I was having a rough day, and they sent a voice memo of their cat purring. That's it. No "have you tried meditation?" Just a cat purring.

Sometimes the most helpful thing someone can do is not try to fix you. Just be there.

I've been tracking anxiety patterns for months. Sleep, caffeine, exercise, social interaction, stress, hormones—so many variables it's hard to isolate any single cause. But I'm noticing some patterns. Anxiety spikes on Sundays (anticipatory stress), on days when I don't leave the apartment (isolation amplifies rumination), and weirdly, after really good days.

That last one is particularly frustrating. Having a great weekend and then spending Sunday night spiraling feels like a cruel joke. But at least recognizing it is something.

My therapist keeps suggesting I observe anxiety without identifying with it. "You are not your thoughts. You are the one watching your thoughts." I understand the concept, but in practice, when anxiety has its claws in me, the distance between me and my thoughts feels like the distance to the moon.

Still, I'm trying. I'm learning that trying is what matters, not succeeding.

Tomorrow will probably be better. And if not, I'll get through it. I'll write about it. Eventually I'll look back at entries like this and remember I've survived worse.`,

    // Career reflection
    `Found myself down a LinkedIn rabbit hole today—one that starts with checking notifications and ends two hours later comparing your life trajectory to people you haven't spoken to since college.

Alex from my graduating class is now a VP at some tech company. Jamie runs their own consulting firm. Three people I barely remember have "Founder & CEO" in their titles. And here I am, five years into a job I'm not sure I even like.

I used to have ambition. Clear, directional ambition. Going to do meaningful work, make a difference, be one of those people who loves Mondays. Somewhere along the way, that fire got replaced by something more like a pilot light—just enough to keep the gas from shutting off.

The question I keep asking: what do I actually want? Not what I think I should want, not what looks good on paper, not what would make my parents proud. What do I, in the quietest part of myself, actually want?

The honest answer is I don't know. And that feels like a moral failing, like everyone else took a course called "Figure Out Your Purpose 101" and I missed enrollment.

But maybe not knowing is okay. Maybe it's even necessary. My career path has been largely reactive—taking opportunities as they came, saying yes to things that seemed promising. That approach got me here, to a decent salary and a comfortable apartment.

What it didn't get me is fulfillment. I've been confusing progress with purpose.

So what would purpose look like? I've been doing this exercise where I think about what I'd do if money weren't a factor. The answer that keeps coming up is teaching. Not formal education necessarily, but sharing what I know. Mentoring. There's this moment when I explain something to a junior colleague and I see the lightbulb go on—that feels more satisfying than any promotion.

But teaching doesn't pay what I'm making now. And I have student loans. What if I'm romanticizing it?

I don't have answers yet. What I have is a growing sense that the current path isn't leading where I want to go.

For now, I'm going to keep exploring. Talk to people who've made career changes. Research alternatives. Give myself permission to want something different without immediately having the whole plan figured out.

It's scary. But it's also, in a weird way, exciting.`,

    // Gratitude and presence
    `Something small happened today that I want to remember.

I was sitting in the park—the one with aggressive geese and the fountain that hasn't worked in months—eating lunch and scrolling through my phone like always. And then I looked up.

I don't know what made me look up. Maybe my neck was sore. Maybe a bird flew past. Whatever the reason, I looked up and saw this little girl—maybe four or five—absolutely losing her mind with joy because she'd found a particularly interesting stick.

Not a special stick. Just a stick. But she was holding it up like Excalibur, showing her dad, running in circles, having what appeared to be the best moment of her entire life.

And I just sat there. Watching. Feeling something shift in my chest.

When did I stop being excited about sticks? When did the world become something to scroll through instead of experience? I understand you can't maintain childlike wonder full-time, that adult life requires efficiency and routine. But still. There has to be some middle ground between being a wide-eyed four-year-old and being a zombie on autopilot.

I've been thinking about gratitude. Not the performative kind—not the "write five things in your gratitude journal" kind that feels like homework. The real kind. The kind that sneaks up on you when you're looking at a kid with a stick and suddenly remember being alive is actually kind of miraculous.

I'm grateful for warm coffee in the morning. For text messages that make me laugh out loud. For the way my apartment smells after I clean it. For having problems that are, in the grand scheme, relatively minor.

That last one feels important. I spend so much time cataloging everything wrong that I forget to notice what's right. Not in a toxic positivity way. In a "yes, and" way. Yes, there are challenges. And also, right now, I'm okay. The sun is out. Someone, somewhere, is delighted by a stick.

I'm going to try to look up more often. Literally and metaphorically.

This probably sounds simple. But sometimes the most important things are exactly what we've heard a hundred times before—we just weren't ready to hear them.

Today I was ready.`,

    // Friendship and connection
    `Had dinner with the old college crew last night. Almost a year since we've all been in the same room. I spent most of yesterday anxiously rehearsing conversation topics, which is a completely normal thing to do before seeing people who are supposed to be your closest friends.

But once we were there—crammed into a booth at that Thai place we used to go to when we had no money and even less taste—something clicked. The awkwardness evaporated after about ten minutes, replaced by that particular laughter where you can barely breathe and your face hurts.

We talked about everything and nothing. Jobs, relationships, that one trip sophomore year we've agreed never to speak of in detail. Taylor is apparently getting married. Jordan finally quit that job they'd complained about for years. Everyone had updates, and everyone was genuinely interested.

It struck me that this—sitting with people who've known you across different versions of yourself—is rare. Maybe irreplaceable.

I've been thinking about friendship lately. How hard it is to maintain as you get older, as everyone's lives get fuller, as the default social infrastructure of school disappears. How easy it is to let connections fade, to replace real friendship with the illusion social media provides.

Seeing their faces on Instagram isn't the same as seeing them across a table. Knowing what they're up to isn't the same as knowing how they're actually doing.

I haven't been great at that lately. I've been isolating without meaning to—declining invitations, not initiating plans, convincing myself I'm just busy when really I'm scared. Scared of being seen. Scared of being the one struggling while everyone else seems to have it figured out.

But here's what I remembered last night: nobody has it figured out. Taylor's engaged but terrified about becoming like her parents. Jordan left the job but has no idea what's next. Everyone is just muddling through.

We made a pact before we left. Monthly dinners. Non-negotiable. I've made pacts like this before and watched them dissolve. But I'm going to try harder this time.

Because the people around that table know who I was. They know who I'm trying to become. And they're still here.`,

    // Processing failure
    `The presentation didn't go well. That's the objective fact. I stumbled over my words. I forgot the key statistic I'd memorized. Someone asked a question I should have anticipated but didn't, and I mumbled through a response that even I didn't find convincing.

By any reasonable measure, I failed.

And here's the weird part: I'm kind of okay? Not delighted. Not pretending it doesn't matter. But also not spiraling into the abyss of self-hatred that usually accompanies these moments.

I think something is shifting in how I relate to failure. For most of my life, failure felt like identity. If I failed at something, I was a failure. Full stop. No separation between action and person.

But lately—maybe because of therapy, maybe because of journaling, maybe just because I'm getting older—I'm starting to see failure differently. Not as evidence of unworthiness, but as information. Data. Feedback on what to do differently next time.

Today I failed because I didn't prepare enough for Q&A. I tried to memorize instead of understand. I didn't practice in conditions that matched the actual environment. These are fixable things. They're not character defects.

That phrase used to drive me crazy. "Areas for improvement" felt like a euphemism. But maybe it's actually just accurate. Maybe everything is an area for improvement. Maybe the whole point of being alive is to gradually, incrementally, improve.

I'm not saying failure feels good. It doesn't. My face got hot during the presentation. I had trouble sleeping. Part of me still wants to quit and move to a remote cabin where presentations don't exist.

But alongside all that, there's a smaller, quieter voice saying: "You survived. You learned something. You'll do better next time."

That voice used to be inaudible, drowned out by screaming self-criticism. Now it's at least a whisper.

Tomorrow I'm going to ask my colleague for honest feedback. Then I'm going to prepare for the next presentation—really prepare—and probably fail slightly less badly.

Progress isn't a straight line. It's a squiggle that trends upward if you zoom out far enough.`,

    // Identity and change
    `I barely recognize the person I was five years ago.

This thought occurred to me while cleaning out old boxes from storage—one of those procrastinated tasks I finally forced myself to do because I needed the space.

I found old journals. Old photos. Old versions of goals lists and life plans I'd completely forgotten making. And the person who made those things... I know it was me. I remember being that person. But I also don't. If I met her now, I'm not sure we'd be friends.

That version of me was so certain about everything. Knew exactly what she wanted—the career, the relationship timeline, the five-year plan in neat bullet points. She was judging the world from a position of youth and limited experience, but she didn't know that.

Current me has approximately zero things figured out. Current me changes her mind constantly. Has abandoned most of those bullet points, not because they were wrong, but because they were written by someone who didn't yet know what she didn't know.

Is that growth? Or just getting older and more confused?

I think it might be both. There's a kind of growth that comes from accumulating certainty—learning skills, building expertise. And there's another kind that comes from losing certainty—unlearning assumptions, questioning beliefs, accepting the world is more complex than any model you can build.

The second kind is harder. Uncomfortable to realize your deeply held opinions might just be the cognitive equivalent of a stubborn toddler repeating "but why?" It's destabilizing to look at your values and wonder how many you actually chose versus how many were installed by default.

But there's also something liberating about it. If past me was wrong about so many things, future me might be wrong about things too. I don't have to defend my current positions as if my life depends on them.

The person I'll be in five years probably won't recognize current me either. She'll look at these journal entries and cringe at my blind spots, feel a mix of compassion and embarrassment.

And that's okay. That's how it should be. If future me agrees with everything current me believes, that would mean I stopped growing.

So here's to past me, with all her certainty and flaws. Here's to future me, whoever she turns out to be. And here's to current me, sitting in this weird middle space, trying to make sense of it all.

We're all just doing our best.`,

    // Mindfulness and present moment
    `Tried meditation again today. The app keeps trying to track my "streak" and send motivational notifications, which seems counterproductive when the whole point is supposed to be non-attachment.

Anyway, I sat there for ten minutes. Ten minutes of trying to focus on my breath while my brain generated an endless parade of distractions. Did I send that email? What should I make for dinner? Why did I say that weird thing in that conversation three years ago?

(The answer to "can you fail at meditation?" is supposedly no. But it still feels like failing when you spend most of the session lost in thought.)

The thing is, despite feeling like I "failed," I noticed something when I stopped. The world seemed slightly quieter. Not literally—the construction across the street was still going strong—but internally. Like someone had turned down the volume on the mental chatter by a few notches.

Is that what mindfulness is? Not complete cessation of thought, but just... less? A slight reduction in the volume of the internal noise machine?

I've been skeptical of mindfulness for years. It seemed like something privileged people did to feel spiritually superior. But lately I've been wondering if my skepticism was just resistance—avoiding the thing because I was afraid of what might happen if I actually slowed down.

Slowing down means noticing. Noticing means feeling. Feeling means potentially dealing with things I've been successfully not dealing with by staying constantly busy.

But avoidance has a cost. The things I'm not dealing with don't go away—they show up in other forms. Anxiety. Insomnia. That vague sense of being disconnected from my own life.

Maybe meditation is for. Not escape, but arrival. Actually being in your life instead of just adjacent to it.

I'm going to keep trying. Not for the streak. Not to achieve enlightenment. Just to see what happens if I spend ten minutes a day actually paying attention.

It might not work. But not paying attention isn't working either. So I might as well try something different.`,
];

// Variation elements for generating 90 unique entries
const TIME_PREFIXES = [
    "Morning thoughts—couldn't sleep well.",
    "Middle of the day, needed a break.",
    "Late night reflection. The house is quiet.",
    "Writing during lunch. Quick break to process.",
    "Sunday evening. That familiar anxiety setting in.",
    "Early morning. Coffee in hand, thoughts swirling.",
    "Post-workout clarity hitting different today.",
    "Rainy afternoon. Perfect for introspection.",
];

const MOOD_SUFFIXES = [
    "Feeling more hopeful today than usual.",
    "It's been a difficult few days.",
    "Something shifted—not sure what yet.",
    "Trying to be honest with myself.",
    "Processing last week's events.",
    "Grateful for small wins today.",
    "Exhausted but oddly at peace.",
    "Questioning everything, as one does.",
];

/**
 * Generate varied entry content
 */
const generateEntry = (index: number): string => {
    const base = BASE_ENTRIES[index % BASE_ENTRIES.length];
    const prefix = TIME_PREFIXES[index % TIME_PREFIXES.length];
    const suffix = MOOD_SUFFIXES[Math.floor(index / 8) % MOOD_SUFFIXES.length];
    return `${prefix}\n\n${base}\n\n${suffix}`;
};

/**
 * Parse CLI arguments
 */
const parseArgs = () => {
    const args = process.argv.slice(2);
    const userId = args.find((arg) => !arg.startsWith("--"));

    if (!userId) {
        console.error(
            "Usage: npx tsx scripts/seed-monthly-usage.ts <user_id> [--clean] [--skip-insights] [--dry-run]",
        );
        process.exit(1);
    }

    return {
        userId,
        clean: args.includes("--clean"),
        skipInsights: args.includes("--skip-insights"),
        dryRun: args.includes("--dry-run"),
    };
};

/**
 * Ensure user exists
 */
const ensureUser = async (userId: string) => {
    const { data } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    if (!data) {
        console.log(`Creating user ${userId}...`);
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
    }
};

/**
 * Clean user data
 */
const cleanData = async (userId: string) => {
    console.log("Cleaning existing data...");

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
    await supabase.from("user_progress").upsert({
        user_id: userId,
        total_entries: 0,
        entry_count_at_last_progress: 0,
    });

    console.log("Data cleaned.");
};

/**
 * Create entries with date distribution
 */
const createEntries = async (userId: string, dryRun: boolean) => {
    const entries: Array<{ id: string; content: string; created_at: string }> =
        [];

    console.log(`\nCreating ${TOTAL_ENTRIES} entries...`);

    for (let i = 0; i < TOTAL_ENTRIES; i++) {
        const content = generateEntry(i);
        const wordCount = content.split(/\s+/).length;

        // Date calculation: oldest entries first
        const date = new Date();
        const dayOffset = DAYS - Math.floor(i / ENTRIES_PER_DAY);
        date.setDate(date.getDate() - dayOffset);
        date.setHours(
            [8, 14, 20][i % ENTRIES_PER_DAY],
            Math.floor(Math.random() * 60),
            0,
            0,
        );

        if (dryRun) {
            entries.push({
                id: `dry-${i}`,
                content,
                created_at: date.toISOString(),
            });
            continue;
        }

        process.stdout.write(
            `\r  Entry ${i + 1}/${TOTAL_ENTRIES} (${wordCount} words)`,
        );

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

        if (error) console.error(`\n  Error on entry ${i + 1}:`, error.message);
        else if (data)
            entries.push({
                id: data.id,
                content: data.content,
                created_at: data.created_at,
            });

        await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`\n  Created ${entries.length} entries.`);
    return entries;
};

/**
 * Generate entry insights (Tier 1)
 */
const createEntryInsights = async (
    userId: string,
    entries: Array<{ id: string; content: string }>,
    dryRun: boolean,
) => {
    console.log(`\nGenerating ${entries.length} entry insights (Tier 1)...`);
    if (dryRun) return entries.length;

    // Dynamic imports to avoid module load issues
    const { streamEntryInsight } = await import(
        "../lib/ai/stream-entry-insight"
    );
    const { insertEntryInsight } = await import("../lib/entry-insights/repo");

    let count = 0;
    for (let i = 0; i < entries.length; i++) {
        process.stdout.write(`\r  Insight ${i + 1}/${entries.length}`);

        try {
            const result = await streamEntryInsight(entries[i].content);
            let text = "";
            for await (const chunk of result.textStream) text += chunk;

            await insertEntryInsight(supabase, {
                userId,
                entryId: entries[i].id,
                content: text,
            });
            count++;
        } catch (e) {
            console.error(`\n  Error on insight ${i + 1}:`, e);
        }

        await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`\n  Created ${count} entry insights.`);
    return count;
};

/**
 * Generate weekly insights (Tier 2)
 */
const createWeeklyInsights = async (
    userId: string,
    entries: Array<{ id: string; content: string; created_at: string }>,
    dryRun: boolean,
) => {
    // Dynamic imports
    const { createWeeklyInsight, getWeekStart } = await import(
        "../lib/weekly-insights/service"
    );

    // Group by week
    const byWeek = new Map<string, typeof entries>();
    for (const entry of entries) {
        const week = getWeekStart(new Date(entry.created_at));
        const existing = byWeek.get(week) ?? [];
        existing.push(entry);
        byWeek.set(week, existing);
    }

    const weeks = Array.from(byWeek.keys()).sort();
    console.log(`\nGenerating ${weeks.length} weekly insights (Tier 2)...`);
    if (dryRun) return weeks.length;

    let count = 0;
    for (const weekStart of weeks) {
        const weekEntries = byWeek.get(weekStart) ?? [];
        console.log(`  Week ${weekStart} (${weekEntries.length} entries)...`);

        if (weekEntries.length < 2) {
            console.log(`    Skipped - need 2+ entries`);
            continue;
        }

        try {
            const result = await createWeeklyInsight(userId, {
                weekStart,
                entryIds: weekEntries.map((e) => e.id),
                entries: weekEntries.map((e) => ({
                    id: e.id,
                    content: e.content,
                    createdAt: e.created_at,
                })),
            });

            if ("error" in result) console.log(`    Error: ${result.error}`);
            else {
                console.log(
                    `    Created with ${result.data?.patterns?.length ?? 0} patterns`,
                );
                count++;
            }
        } catch (e) {
            console.error(`    Failed:`, e);
        }

        await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`  Created ${count} weekly insights.`);
    return count;
};

/**
 * Generate progress insights (Tier 3)
 */
const createProgressInsights = async (
    userId: string,
    entries: Array<{ id: string; content: string; created_at: string }>,
    dryRun: boolean,
) => {
    const progressCount = Math.floor(entries.length / PROGRESS_INTERVAL);
    console.log(`\nGenerating ${progressCount} progress insights (Tier 3)...`);
    if (dryRun) return progressCount;

    // Dynamic import
    const { createProgressInsight } = await import(
        "../lib/progress-insights/service"
    );

    let count = 0;
    for (let i = 1; i <= progressCount; i++) {
        const start = (i - 1) * PROGRESS_INTERVAL;
        const end = i * PROGRESS_INTERVAL;
        const recent = entries.slice(start, end);
        const past = entries.slice(0, start).slice(-7);

        console.log(
            `  Progress ${i}/${progressCount} (entries ${start + 1}-${end})...`,
        );

        try {
            const result = await createProgressInsight(userId, {
                recentEntryIds: recent.map((e) => e.id),
                recentEntries: recent.map((e) => ({
                    id: e.id,
                    content: e.content,
                    createdAt: e.created_at,
                })),
                relatedPastEntries: past.map((e) => ({
                    id: e.id,
                    content: e.content,
                    createdAt: e.created_at,
                })),
            });

            if ("error" in result) console.log(`    Error: ${result.error}`);
            else {
                console.log(`    Created`);
                count++;
            }
        } catch (e) {
            console.error(`    Failed:`, e);
        }

        await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`  Created ${count} progress insights.`);
    return count;
};

/**
 * Main
 */
const main = async () => {
    const { userId, clean, skipInsights, dryRun } = parseArgs();

    console.log("\n=== Heavy User Monthly Seeder ===");
    console.log(`User: ${userId}`);
    console.log(
        `Entries: ${TOTAL_ENTRIES} | Weekly: ~${Math.ceil(DAYS / 7)} | Progress: ${Math.floor(TOTAL_ENTRIES / PROGRESS_INTERVAL)}`,
    );
    console.log(
        `Options: ${[clean && "clean", skipInsights && "skip-insights", dryRun && "dry-run"].filter(Boolean).join(", ") || "none"}\n`,
    );

    if (!dryRun) await ensureUser(userId);
    if (clean && !dryRun) await cleanData(userId);

    const entries = await createEntries(userId, dryRun);

    if (!skipInsights) {
        await createEntryInsights(userId, entries, dryRun);
        await createWeeklyInsights(userId, entries, dryRun);
        await createProgressInsights(userId, entries, dryRun);
    }

    if (!dryRun) {
        await supabase.from("user_progress").upsert({
            user_id: userId,
            total_entries: entries.length,
            entry_count_at_last_progress: entries.length,
        });
    }

    const totalWords = entries.reduce(
        (sum, e) => sum + e.content.split(/\s+/).length,
        0,
    );
    console.log(`\n=== Complete ===`);
    console.log(
        `Entries: ${entries.length} | Words: ${totalWords.toLocaleString()} | Avg: ${Math.round(totalWords / entries.length)}/entry`,
    );

    if (dryRun)
        console.log(
            "\n[DRY RUN] No data written. Run without --dry-run to execute.",
        );
};

main().catch(console.error);
