/**
 * Universal User Seeder
 *
 * Seeds a single user with a realistic history of entries, insights,
 * weekly patterns, and progress insights — enough to test every list
 * card and detail page.
 *
 * Usage:
 *   npx tsx scripts/seed-user.ts --user-id=<clerk_id> [options]
 *
 * Options:
 *   --weeks=<n>             History depth (default: 6)
 *   --entries-per-week=<n>  Entries per week (default: 5)
 *   --clean                 Delete all existing data for this user first
 *   --with-ai               Use real AI generation (default: mock mode)
 *   --dry-run               Print plan without writing to DB
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
const PROGRESS_INTERVAL = 15;

// ─── CLI ──────────────────────────────────────────────────────────────────────

const parseArgs = () => {
    const args = process.argv.slice(2);
    const get = (flag: string) => {
        const match = args.find((a) => a.startsWith(`--${flag}=`));
        return match ? match.split("=")[1] : null;
    };

    const userId = get("user-id");
    if (!userId) {
        console.error(
            "Usage: npx tsx scripts/seed-user.ts --user-id=<clerk_id> [--weeks=6] [--entries-per-week=5] [--clean] [--with-ai] [--dry-run]",
        );
        process.exit(1);
    }

    return {
        userId,
        weeks: Number.parseInt(get("weeks") ?? "6", 10),
        entriesPerWeek: Number.parseInt(get("entries-per-week") ?? "5", 10),
        clean: args.includes("--clean"),
        withAi: args.includes("--with-ai"),
        dryRun: args.includes("--dry-run"),
    };
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// 30 unique entries across 3 arcs:
//   Arc A (0–9):  Work pressure & overcommitting
//   Arc B (10–19): Relationships & vulnerability
//   Arc C (20–29): Identity, health & meaning

const MOCK_ENTRIES: Array<{
    content: string;
    tags: string[];
    insight: string;
}> = [
    // ── Arc A ──────────────────────────────────────────────────────────────
    {
        content: `Said yes to another project today without thinking. My manager asked if I could take on the Henderson account "while keeping everything else running," and I heard myself agree before the sentence was finished. Drove home wondering why I do this. There's a version of me that knows better. She watches the whole thing happen in slow motion and still doesn't stop it.`,
        tags: ["Work", "Boundaries"],
        insight: `The yes happened before the question finished. That's not agreement — it's reflex. Somewhere along the way you learned that hesitation costs more than overcommitment. That equation is worth questioning.`,
    },
    {
        content: `Stayed until 7:30 again. The work was fine; the staying was not. I have this idea that if I just get ahead, the pressure will ease. But I've been trying to get ahead for two years and I'm always in the same place. The hamster wheel doesn't care how fast you run.`,
        tags: ["Work", "Anxiety"],
        insight: `Working longer to escape the feeling of being behind is the loop you're in. The feeling doesn't go away with hours — it goes away with decisions. This is not a time management problem.`,
    },
    {
        content: `Opportunity to speak in the team meeting. I had a real point — about the timeline being unrealistic — and I watched myself dilute it into nothing. By the time I finished the sentence it was barely a suggestion. The person next to me said exactly what I meant, five minutes later, and got nodded along. I felt this mix of relief and bitterness I can't quite name.`,
        tags: ["Work", "Confidence"],
        insight: `You said the thing and unsaid it in the same breath. The bitterness isn't about them nodding at someone else — it's about the version of you that edited herself into silence. That editor has been very busy.`,
    },
    {
        content: `Had lunch with Priya. She left her last company because she "couldn't keep pretending to be fine." I asked what that felt like and she said it felt like the first honest thing she'd done in years. I keep thinking about that phrase. The first honest thing.`,
        tags: ["Work", "Relationships"],
        insight: `Priya's phrase is landing because it's naming something you already know. How much of your current day is performance? Not dishonesty exactly — just a sustained effort to appear more okay than you are?`,
    },
    {
        content: `Small thing today. My manager asked if I could handle one more thing by Friday and I said "let me look at what I have and come back to you." She said fine. That was it. No consequences. No disappointed face. Just fine. I don't know why I expected catastrophe.`,
        tags: ["Work", "Boundaries"],
        insight: `The disaster you braced for didn't come. It rarely does. You are accumulating evidence that the world doesn't end when you pause before agreeing. That evidence is worth collecting deliberately.`,
    },
    {
        content: `Sunday evenings have their own weather system. I can feel it coming from about 4pm — a creeping dread that has nothing to do with anything specific Monday holds and everything to do with the whole shape of my week. I used to think this was normal. I'm less sure now.`,
        tags: ["Anxiety", "Work"],
        insight: `The dread is arriving before any actual threat. That's your nervous system anticipating, not responding. Sunday anxiety is your body telling you the cost of the week is higher than you've admitted to yourself.`,
    },
    {
        content: `Pushed back on a deadline for the first time. Actually said "that timeline doesn't work for what you're asking." Heart was going. I said it anyway. My manager looked at me for a second and then said okay, what do you need? I had to stop myself from apologizing.`,
        tags: ["Work", "Boundaries"],
        insight: `You didn't just push back on a deadline. You pushed back on a belief you've held for years — that honesty about capacity ends relationships. Your manager's response is data. What are you going to do with it?`,
    },
    {
        content: `Found myself listing all the reasons I can't say no. I'm junior. The team needs me. I don't want to be seen as difficult. What if they give the interesting work to someone else? Then I listed all the costs of saying yes. They were longer. The lists are a stall, though. I know what the answer is.`,
        tags: ["Work", "Boundaries"],
        insight: `You made both lists and you know which one wins. The hesitation isn't confusion — it's avoidance. The question isn't what you should do. It's what's making the thing you should do feel like too much right now.`,
    },
    {
        content: `Turned down an optional project today. Said I was at capacity. My chest tightened when I hit send. But nothing terrible happened. And more interestingly — I felt present for the rest of the afternoon in a way I haven't in weeks. Like I was actually at work instead of watching myself be at work from somewhere slightly above and to the left.`,
        tags: ["Work", "Growth"],
        insight: `Presence returned when you made space for it. You've been so focused on the cost of limits that you haven't noticed what they give back. Today you got a sample.`,
    },
    {
        content: `Noticed I'm tired differently than I used to be. Old tired was physical — just needing sleep. This tired is something else. Heavy in a specific way. It lives in the chest, not the muscles. I think it's the accumulated weight of all the things I've agreed to while meaning something else.`,
        tags: ["Work", "Anxiety"],
        insight: `That chest-tired is worth paying attention to. The body accounts for what the mind dismisses. You've been keeping a ledger of resentment without realizing it. The fatigue is the bill.`,
    },
    // ── Arc B ──────────────────────────────────────────────────────────────
    {
        content: `Ran into Jamie at the coffee shop. We haven't talked in eight months — no falling out, just drift. We stood there for a few minutes and I realized I'd been telling myself we weren't close anymore when really I'd just stopped showing up. That felt important to notice.`,
        tags: ["Relationships", "Growth"],
        insight: `The distance you attributed to "we drifted" was actually a choice you kept making without calling it that. The important question isn't why Jamie didn't reach out — it's why you didn't.`,
    },
    {
        content: `Hard conversation with my sister last night. She said I seem far away lately and asked if I was okay. My first instinct was to say yes, fine, everything's good. I stopped myself. Told her I was having a hard stretch at work and feeling a bit lost. She didn't fix it. She just said "that sounds hard." And that was exactly right.`,
        tags: ["Relationships", "Vulnerability"],
        insight: `You stopped yourself from performing okay and told the truth instead. Your sister didn't fix it — she witnessed it. Sometimes witnessed is all that's needed. You gave yourself something today by letting her give that to you.`,
    },
    {
        content: `Been thinking about how I show up with people I care about versus people I want to impress. With friends, I'm relaxed, I'll say the dumb thing, I'll admit not knowing. With people I want to think well of me, I'm curated. Everything considered. I wonder how much of my life is being lived in the second mode when it didn't have to be.`,
        tags: ["Relationships", "Identity"],
        insight: `The gap between curated-you and real-you takes energy to maintain. That's not a moral problem — it's a practical one. The question is who decided the people you want to impress couldn't handle the real version.`,
    },
    {
        content: `Something small hurt my feelings today and I couldn't figure out why. A comment that probably meant nothing. I sat with it instead of explaining it away and eventually found what was underneath: I've been feeling invisible and this was the thing that finally tripped the wire. The comment wasn't the thing. It was the landing place for something that had been building.`,
        tags: ["Relationships", "Emotional Awareness"],
        insight: `The comment wasn't the wound. It was where the wound made itself known. Finding that distinction is something. Most people just stay angry at the comment.`,
    },
    {
        content: `Six weeks in. Something is happening that I don't fully have words for yet. I'm still saying yes too often at work. The relationships still feel complicated. But I'm watching myself more closely than I used to. I'm catching things earlier. The lag between feeling something and knowing I'm feeling it is getting shorter. That's not nothing.`,
        tags: ["Growth", "Self-awareness"],
        insight: `The lag is closing. You're right that this is not nothing — it might be the most important thing. Pattern recognition is the precondition for pattern change. You're building the instrument before you use it.`,
    },
    {
        content: `Called my dad. We're not close in the way where we talk about real things, but I called anyway and asked how he was actually doing. There was a pause. Then he started talking. About retirement being harder than expected, about feeling purposeless. I didn't know any of this. We talk often. We say very little.`,
        tags: ["Relationships", "Family"],
        insight: `The real conversation was in the pause. You asked differently and he answered differently. This isn't about your dad being guarded — it's about the question you'd never asked before. What else hasn't been asked?`,
    },
    {
        content: `Got into a conflict with a friend over something small. My usual move is to smooth it over immediately, apologize preemptively, make the awkwardness go away. This time I let it sit. Said I needed to think about it. When we talked the next day, it was an actual conversation instead of a performance of one.`,
        tags: ["Relationships", "Growth"],
        insight: `Letting conflict breathe instead of immediately suffocating it — that's new behavior. The real conversation on day two happened because you didn't erase the tension on day one. There's something in that.`,
    },
    {
        content: `Noticed I keep making myself smaller around a specific person in my life. Not because they ask me to — I do it automatically. Pre-editing my opinions, bracing for judgment that usually doesn't come, feeling relieved when they seem pleased. I don't fully know what this is about yet but I'm naming it.`,
        tags: ["Relationships", "Patterns"],
        insight: `Naming it is the first move. You've identified a relationship where you've assigned authority to someone else's approval. The next question isn't why — it's whether that assignment was ever something they asked for or something you decided.`,
    },
    {
        content: `Made a plan to see three people I'd been putting off. Not big plans. Just coffee, a walk, an hour. I've been waiting to feel ready to be social. I don't think ready is coming on its own. So I scheduled the thing and I'll let ready catch up.`,
        tags: ["Relationships", "Growth"],
        insight: `You stopped waiting for the feeling and made the structural decision. That's the right order. Motivation follows action more reliably than the other way around. The scheduling was the work.`,
    },
    {
        content: `The coffee with Jamie was good. Simple. We didn't try to catch up on eight months — we just talked about what was current. When I left I felt full in a way I hadn't expected. Not because anything important was said. Because I was actually there instead of managing my presence.`,
        tags: ["Relationships", "Presence"],
        insight: `You were present instead of performing presence. Those feel similar from the outside but completely different from the inside. You felt the difference. That's what you were chasing without knowing the word for it.`,
    },
    // ── Arc C ──────────────────────────────────────────────────────────────
    {
        content: `Went for a run. First one in a while. My body complained loudly for the first fifteen minutes and then something shifted and I felt — briefly, unmistakably — like myself. I've been looking for that feeling in the wrong places. It was in the running shoes under my bed.`,
        tags: ["Health", "Identity"],
        insight: `The body remembers what the mind overthinks. You found yourself in movement today. The question isn't why it took this long — it's what else you've been looking for in the wrong places.`,
    },
    {
        content: `Started wondering what I'd do if the job disappeared tomorrow. Not in a catastrophizing way — in a "what would I actually choose" way. The answer surprised me. I think I'd teach. Or write. Something that makes slow things. I've spent so much time being fast and optimized and I'm not sure I chose that.`,
        tags: ["Career", "Identity"],
        insight: `The surprise is worth paying attention to. You found an answer you weren't expecting, which means it wasn't performed. If you'd build slow things with freedom, it's worth asking what you're building now and whether it's what you meant to be building.`,
    },
    {
        content: `Big presentation at work went badly. Not catastrophically, just badly — stumbled over the main point, missed a question I should have seen coming. Old me would have replayed it for days. Current me replayed it for one evening, wrote down what I'd do differently, and went to bed. That's not nothing.`,
        tags: ["Work", "Growth"],
        insight: `One evening instead of days. That's a real shift — from failure as identity to failure as information. You're not failing differently. You're recovering differently. That's what actually changes over time.`,
    },
    {
        content: `Not knowing what I want feels like a character flaw some days. Like everyone else got the manual and I missed it. But I'm starting to think not-knowing is just where you are before you know. And rushing to an answer to avoid the discomfort of not having one usually produces a wrong answer that's just confident.`,
        tags: ["Identity", "Growth"],
        insight: `The manual doesn't exist. You've been waiting for certainty that isn't coming and interpreting its absence as failure. Not knowing what you want is not a flaw — it's the honest beginning of finding out.`,
    },
    {
        content: `Three runs this week. Didn't negotiate. Didn't think about whether I wanted to. Just went. The decision stopped being a decision and became a thing that happens on Tuesday, Thursday, Saturday. I want to understand the mechanism that made that happen so I can apply it elsewhere.`,
        tags: ["Health", "Habits"],
        insight: `The decision stopped requiring willpower when you stopped leaving it open. You automated it. That's the mechanism: remove the choice point. What else are you re-deciding every day that could just be decided once?`,
    },
    {
        content: `A moment of unexpected clarity in the park today. Watching someone else be happy in a completely uncomplicated way and feeling — not envy, but reminder. Like seeing a sign for somewhere you used to know how to get to. I haven't been uncomplicated in a while. I'm not sure I need to be. But it's something to aim adjacent to.`,
        tags: ["Presence", "Growth"],
        insight: `You weren't envying the happiness — you were recognizing something. The sign pointed somewhere real. Adjacent to uncomplicated is still closer than where you've been. What would one degree of simplification look like?`,
    },
    {
        content: `Caught an old pattern starting. That familiar sequence: someone asks something, I feel the pull to say yes, the yes starts forming. But this time the gap between feeling and acting was just long enough. I let the pause happen. Didn't fill it. Came out the other side with an answer I actually meant.`,
        tags: ["Growth", "Boundaries"],
        insight: `The gap is getting longer. You're building the pause deliberately now instead of stumbling into it occasionally. That pause is where choice lives. The pattern hasn't disappeared but the gap is yours now.`,
    },
    {
        content: `Spent an evening doing nothing intentional. No optimization. No catching up. Just existing in the apartment. It felt uncomfortable at first and then it didn't. I think I've been confusing busyness with aliveness. They're not the same thing. I've been very busy.`,
        tags: ["Presence", "Identity"],
        insight: `Busyness as a substitute for aliveness — that's the thing you named tonight. The discomfort that faded is important: the stillness didn't kill you. There's more of yourself in the quiet than you expected to find.`,
    },
    {
        content: `Wrote a list of things I'm proud of from the last six weeks. Not achievements — behaviors. Saying something true instead of something smooth. Letting a conversation be awkward instead of fixing it. Going for the run. They're small. They're also exactly what I was working toward and didn't know I was working toward.`,
        tags: ["Growth", "Self-awareness"],
        insight: `You set out to understand yourself better and accumulated evidence of yourself changing without noticing. The list isn't small — the items just look small from close up. Zoom out.`,
    },
    {
        content: `The question I'm sitting with: what do I want the next six weeks to look like? Not the year, not the career, not the life plan. Just the next six weeks. Something about that scale feels manageable. Like something I can actually answer honestly rather than aspire to vaguely.`,
        tags: ["Growth", "Intention"],
        insight: `You've found the right frame: not the life, the six weeks. Vague aspiration doesn't change behavior. Specific intention does. You're asking the right size question now. Answer it the same way — honestly, without performing certainty you don't have.`,
    },
];

// 3 patterns per week × 6 weeks
// Note: DB migration has a typo — constraint uses "recurring_theme" (double c)
// so we must match exactly what the DB check constraint accepts.
import type { PatternTypeCode } from "@/lib/constants/pattern-types";

const MOCK_WEEKLY_PATTERNS: Array<
    Array<{
        title: string;
        patternType: PatternTypeCode;
        description: string;
        question: string;
        suggestedExperiment: string;
    }>
> = [
    // Week 1
    [
        {
            title: "The Automatic Yes",
            patternType: "behavioral_pattern",
            description:
                "You agreed to multiple requests this week before completing a full thought. The yes is a reflex, not a decision — it happens before evaluation, driven by a deep assumption that hesitation has social costs.",
            question:
                "What would you actually say if you took three seconds before answering every request this week?",
            suggestedExperiment:
                "Introduce one phrase: 'let me come back to you on that.' Use it once for anything this week. Notice what happens.",
        },
        {
            title: "Working Later as a Coping Strategy",
            patternType: "emotional_trigger",
            description:
                "Staying late isn't solving the problem — it's managing the feeling of being behind. The extra hours provide temporary relief that requires the same action again tomorrow.",
            question:
                "What would you have to admit if you left on time tonight?",
            suggestedExperiment:
                "Leave at your actual end time one day this week. Note what feeling arises and whether it matches what you expected.",
        },
        {
            title: "Silencing the Real Point",
            patternType: "blind_spot",
            description:
                "You had something real to say about the timeline and edited it into something harmless. This pattern is consistent: self-censorship at the moment of actual relevance, followed by resentment watching someone else say a version of it.",
            question:
                "Whose permission are you waiting for to say what you actually think?",
            suggestedExperiment:
                "In one meeting this week, say the real version of your thought instead of the softened version. One sentence.",
        },
    ],
    // Week 2
    [
        {
            title: "Sunday Dread as Signal",
            patternType: "recurring_theme",
            description:
                "Sunday anxiety is appearing consistently as a leading indicator. It's not about Monday — it's about the accumulated cost of commitments you've made without fully consenting to them.",
            question:
                "If Sunday felt neutral, what would need to be different about your week?",
            suggestedExperiment:
                "On Sunday evening, list everything you're dreading. Mark each one: 'my choice' or 'not my choice.' Notice the split.",
        },
        {
            title: "Evidence Against Catastrophe",
            patternType: "growth",
            description:
                "You pushed back on a deadline and survived. You said 'let me come back to you' and the relationship didn't end. You're slowly accumulating counter-evidence to the story that honesty about capacity has severe social costs.",
            question:
                "What would you do differently if you really believed the catastrophe wasn't coming?",
            suggestedExperiment:
                "Write down the worst case you're protecting against in one situation at work. Then ask: has this ever actually happened?",
        },
        {
            title: "The Cost of the Yes",
            patternType: "unmet_need",
            description:
                "You've listed the reasons you can't say no, but the list of costs was longer. Underneath the yes-reflex is an unmet need for belonging and approval that makes saying no feel like risking the relationship.",
            question: "What need does the automatic yes meet for you?",
            suggestedExperiment:
                "The next time you feel the pull to say yes, pause and ask: what am I afraid will happen if I don't? Write it down before answering.",
        },
    ],
    // Week 3
    [
        {
            title: "Drift as a Decision",
            patternType: "blind_spot",
            description:
                "You described several relationships that 'drifted' but on closer look, the drift was a series of small choices not to reach out. You attributed the distance to circumstance. It was action.",
            question:
                "Which relationships have you let drift that you're pretending just happened?",
            suggestedExperiment:
                "Reach out to one person you've drifted from this week. Not to catch up — just to say something true. One message.",
        },
        {
            title: "Performing Okay",
            patternType: "recurring_theme",
            description:
                "There's a reflex toward 'fine, everything's good' when someone asks how you are. It appears across multiple contexts. The performance of okay is so automatic that real answers feel like a disruption rather than a response.",
            question:
                "When someone you trust asks how you are, what's the honest answer this week?",
            suggestedExperiment:
                "Give one honest answer this week when someone asks how you're doing — not detailed, just real. Notice how they respond.",
        },
        {
            title: "Two Modes of Being",
            patternType: "behavioral_pattern",
            description:
                "You've identified a split: relaxed and real with close friends, curated and careful with people you want to impress. The energy required to maintain the second mode accumulates. Most of your day is spent in it.",
            question:
                "Who in your life sees the uncurated version? What does that feel like differently?",
            suggestedExperiment:
                "In one interaction this week with someone you usually curate around, say one thing that isn't pre-edited.",
        },
    ],
    // Week 4
    [
        {
            title: "Calling vs. Connecting",
            patternType: "blind_spot",
            description:
                "You talk to your father often and say very little. Frequency and depth aren't the same thing. The habit of frequent but shallow contact creates the feeling of connection without the substance of it.",
            question:
                "In which relationships are you confusing frequency for depth?",
            suggestedExperiment:
                "In your next regular conversation with someone, ask one question you've never asked them before. Not a big question — just one you haven't asked.",
        },
        {
            title: "Letting Conflict Breathe",
            patternType: "growth",
            description:
                "You changed your behavior in a conflict this week — let it sit instead of immediately resolving it. The result was a real conversation instead of a performance of one. This is meaningfully different from your baseline pattern.",
            question:
                "What have you been rushing to resolve that might benefit from some air?",
            suggestedExperiment:
                "The next time you feel the pull to make an awkward thing comfortable immediately, wait a day. Notice whether it resolves itself or becomes clearer.",
        },
        {
            title: "Assigned Authority",
            patternType: "emotional_trigger",
            description:
                "You're making yourself smaller around one specific person without them asking you to. The self-editing, the bracing for judgment, the relief when they're pleased — this is a pattern of assigned authority.",
            question:
                "Did this person ever ask for the authority you've given them? What would it look like to quietly take some back?",
            suggestedExperiment:
                "In your next interaction with this person, express one opinion without softening it first. Watch their actual response, not the one you predicted.",
        },
    ],
    // Week 5
    [
        {
            title: "The Wrong Question About Readiness",
            patternType: "behavioral_pattern",
            description:
                "You've been waiting to feel ready before being social. This week you scheduled first and let readiness catch up. The pattern of waiting for the feeling before making the structural decision is backwards.",
            question:
                "What else in your life are you waiting to feel ready for that won't come until you begin?",
            suggestedExperiment:
                "Identify one thing you've been getting ready for. Schedule it this week. Do not wait for the feeling.",
        },
        {
            title: "Movement as a Route to Self",
            patternType: "recurring_theme",
            description:
                "Running isn't just appearing as a health behavior — it's appearing as a site where you find yourself. That fifteen-minute shift where you felt like yourself is significant. You've been searching for that feeling in slower, more cognitive places.",
            question:
                "What does your body know that your mind keeps overcomplicating?",
            suggestedExperiment:
                "Before any difficult decision or conversation this week, move your body first. Not to feel better — to think more clearly.",
        },
        {
            title: "Busyness as Substitution",
            patternType: "blind_spot",
            description:
                "You named something important: busyness and aliveness aren't the same. You've been very busy. The confusion between the two is consistent across multiple entries — optimization, efficiency, staying later — all in service of a feeling that the activity itself doesn't produce.",
            question:
                "What are you actually looking for when you fill time? Is the thing you're filling it with finding it?",
            suggestedExperiment:
                "Schedule one hour this week with nothing in it. Not rest time, not thinking time. Nothing time. Notice what comes up.",
        },
    ],
    // Week 6
    [
        {
            title: "The Pause Is Yours Now",
            patternType: "growth",
            description:
                "The gap between impulse and action is measurably longer. You caught yourself before the automatic yes several times this week. The behavior hasn't disappeared but the pause between feeling and acting is becoming deliberate. That pause is where choice lives.",
            question:
                "What would you choose more often if the pause was always available?",
            suggestedExperiment:
                "Deliberately slow your response time by three seconds in every non-urgent conversation this week. Notice where you feel the pull to rush.",
        },
        {
            title: "Small Behaviors, Real Change",
            patternType: "growth",
            description:
                "The things you listed as proud of weren't achievements — they were behaviors: saying something true instead of smooth, letting conflict breathe, choosing to move. You've been tracking the wrong metrics. The real change was already happening.",
            question:
                "If you tracked behaviors instead of outcomes for a month, what would you want to see on the list?",
            suggestedExperiment:
                "At the end of each day this week, write down one thing you did that was slightly truer to who you're becoming than your old default.",
        },
        {
            title: "The Right Scale",
            patternType: "recurring_theme",
            description:
                "You've been holding questions that are too large to answer honestly — the life plan, the career, the five-year version. This week you found the right scale: six weeks. The pattern of holding huge unanswerable questions has been blocking the answerable ones.",
            question:
                "What's the smallest version of the question you've been trying to answer?",
            suggestedExperiment:
                "Take one 'big' open question and reframe it as a six-week version. What would you do in these six weeks that moves it forward?",
        },
    ],
];

// 2 mock progress insight JSON payloads (stored as snake_case, transformer converts to camelCase)
const MOCK_PROGRESS_CONTENT = [
    {
        headline: "You're learning what the automatic yes has been protecting",
        whats_on_repeat:
            "A reflexive agreement that happens before any real evaluation. It shows up at work, in planning, in how you respond to requests. You've noticed it twice as many times in the last few weeks as you had in months before — not because it's getting worse, but because you're watching more closely.",
        what_changed:
            "The pause is new. You introduced a small buffer — 'let me come back to you' — and something shifted. The gap between feeling and acting got longer in at least two situations where it used to be instant. That's a real change.",
        reality_check:
            "The catastrophe you were protecting against — the disappointed manager, the relationship ending, the reputation for being difficult — hasn't materialized. The evidence is starting to run the other direction.",
        experiment:
            "For the next two weeks: before agreeing to anything that will take more than an hour of your time, write down what you're giving up before you say yes. Not to prevent the yes — just to make it a conscious one.",
        the_question:
            "If the automatic yes is protecting something, what is it protecting? What do you believe would happen if you became known as someone who sometimes says no?",
        key_entry_numbers: [3, 8, 14],
        is_milestone: false,
    },
    {
        headline:
            "The lag is closing — you're catching yourself earlier every time",
        whats_on_repeat:
            "A gap between feeling something and naming it that's been getting shorter. Six weeks ago you'd notice the resentment at the end of the day. Now you're catching the pull in real time — before the yes forms, before the silence lands, before you've left the conversation.",
        what_changed:
            "You moved your body and found yourself there. You let a conflict breathe and got a real conversation. You called your dad differently and he answered differently. These aren't adjacent things — they're the same thing: you stopped performing and started arriving.",
        reality_check:
            "You're still saying yes when you mean no sometimes. Still editing yourself in rooms where you could speak. But the ratio is changing, and more importantly, the story you tell about those moments is changing — from shame to curiosity. That's the real shift.",
        experiment:
            "Take the list of behaviors you were proud of last week and keep it. Add to it every week for the next month. Not what you accomplished — what you did that was truer to who you're becoming.",
        the_question:
            "What would the next six weeks look like if you designed them for who you're becoming, not who you've been?",
        key_entry_numbers: [3, 8, 14],
        is_milestone: false,
    },
];

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

/** Oldest entries first. Within each week, spread across 5 days at varied hours. */
const computeEntryDates = (weeks: number, entriesPerWeek: number): Date[] => {
    const now = new Date();
    const HOURS = [8, 11, 14, 17, 20];
    const dates: Date[] = [];

    for (let i = 0; i < weeks * entriesPerWeek; i++) {
        const weekIndex = Math.floor(i / entriesPerWeek); // 0 = oldest week
        const posInWeek = i % entriesPerWeek;
        const weekStartDaysAgo = (weeks - weekIndex) * 7 - 1;
        const daysAgo = weekStartDaysAgo - posInWeek;

        const d = new Date(now);
        d.setDate(d.getDate() - Math.max(0, daysAgo));
        d.setHours(HOURS[posInWeek % HOURS.length], (i * 7) % 59, 0, 0);
        dates.push(d);
    }

    return dates;
};

// ─── DB SETUP ─────────────────────────────────────────────────────────────────

const ensureUser = async (userId: string) => {
    const { data } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

    if (!data) {
        const email = `seed+${userId.slice(-8)}@unsaid.dev`;
        await supabase.from("users").insert({ user_id: userId, email });
        await supabase
            .from("subscriptions")
            .insert({ user_id: userId, status: "active" });
        await supabase.from("user_progress").insert({
            user_id: userId,
            total_entries: 0,
            entry_count_at_last_progress: 0,
        });
        console.log(`  ✓ User created: ${userId.slice(0, 16)}...`);
    } else {
        console.log(`  ✓ User verified: ${userId.slice(0, 16)}...`);
    }
};

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

    await supabase.from("progress_insights").delete().eq("user_id", userId);
    await supabase.from("entry_insights").delete().eq("user_id", userId);
    await supabase.from("weekly_insights").delete().eq("user_id", userId);
    await supabase.from("entries").delete().eq("user_id", userId);
    await supabase.from("user_progress").upsert(
        {
            user_id: userId,
            total_entries: 0,
            entry_count_at_last_progress: 0,
        },
        { onConflict: "user_id" },
    );

    console.log("  ✓ All data cleared\n");
};

// ─── PHASE 1: ENTRIES ─────────────────────────────────────────────────────────

type SeededEntry = { id: string; content: string; createdAt: string };

const seedEntries = async (
    userId: string,
    weeks: number,
    entriesPerWeek: number,
    dryRun: boolean,
): Promise<SeededEntry[]> => {
    const total = weeks * entriesPerWeek;
    const dates = computeEntryDates(weeks, entriesPerWeek);

    console.log(
        `\nPhase 1 — Entries (${total} total, ${entriesPerWeek}/week × ${weeks} weeks)`,
    );

    if (dryRun) {
        console.log(`  [dry-run] Would create ${total} entries`);
        return dates.map((d, i) => ({
            id: `dry-${i}`,
            content: MOCK_ENTRIES[i % MOCK_ENTRIES.length].content,
            createdAt: d.toISOString(),
        }));
    }

    const { insertEntry } = await import("../lib/entries/repo");
    const entries: SeededEntry[] = [];

    for (let i = 0; i < total; i++) {
        const template = MOCK_ENTRIES[i % MOCK_ENTRIES.length];
        const date = dates[i];

        process.stdout.write(`\r  Entry ${i + 1}/${total}`);

        const { data: entry, error } = await insertEntry(supabase, {
            userId,
            content: template.content,
            wordCount: template.content.split(/\s+/).length,
        });

        if (error || !entry) {
            console.error(`\n  ❌ Entry ${i + 1} failed:`, error?.message);
            continue;
        }

        // Stagger created_at + set zero embedding (no AI cost in mock mode)
        await supabase
            .from("entries")
            .update({
                created_at: date.toISOString(),
                embedding: ZERO_EMBEDDING,
            })
            .eq("id", entry.id);

        entries.push({
            id: entry.id,
            content: template.content,
            createdAt: date.toISOString(),
        });
    }

    console.log(`\n  ✓ ${entries.length}/${total} entries created`);
    return entries;
};

// ─── PHASE 2: ENTRY INSIGHTS ──────────────────────────────────────────────────

const seedEntryInsights = async (
    userId: string,
    entries: SeededEntry[],
    withAi: boolean,
    dryRun: boolean,
) => {
    console.log(
        `\nPhase 2 — Entry Insights (Tier 1, ${withAi ? "AI" : "mock"})`,
    );

    if (dryRun) {
        console.log(
            `  [dry-run] Would create ${entries.length} entry insights`,
        );
        return;
    }

    const { createEntryInsight } = await import("../lib/entry-insights/repo");

    if (withAi) {
        const { streamEntryInsight } = await import(
            "../lib/ai/stream-entry-insight"
        );
        for (let i = 0; i < entries.length; i++) {
            process.stdout.write(`\r  Insight ${i + 1}/${entries.length} (AI)`);
            try {
                const result = await streamEntryInsight(entries[i].content);
                const rawText = await result.text;
                const parsed = JSON.parse(rawText) as {
                    insight: string;
                    tags: string[];
                };
                await createEntryInsight(supabase, {
                    userId,
                    entryId: entries[i].id,
                    content: parsed.insight,
                    tags: parsed.tags,
                    generationOrder: 1,
                });
            } catch (e) {
                console.error(`\n  ❌ AI insight ${i + 1} failed:`, e);
            }
            await new Promise((r) => setTimeout(r, 300));
        }
        console.log(`\n  ✓ ${entries.length} AI insights created`);
        return;
    }

    // Mock mode — use pre-written insights
    for (let i = 0; i < entries.length; i++) {
        const template = MOCK_ENTRIES[i % MOCK_ENTRIES.length];
        process.stdout.write(`\r  Insight ${i + 1}/${entries.length}`);
        await createEntryInsight(supabase, {
            userId,
            entryId: entries[i].id,
            content: template.insight,
            tags: template.tags,
            generationOrder: 1,
        });
    }
    console.log(`\n  ✓ ${entries.length} mock insights created`);
};

// ─── PHASE 3: WEEKLY INSIGHTS ─────────────────────────────────────────────────

const seedWeeklyInsights = async (
    userId: string,
    entries: SeededEntry[],
    entriesPerWeek: number,
    withAi: boolean,
    dryRun: boolean,
) => {
    const weekCount = Math.ceil(entries.length / entriesPerWeek);
    console.log(
        `\nPhase 3 — Weekly Insights (Tier 2, ${weekCount} weeks, ${withAi ? "AI" : "mock"})`,
    );

    if (dryRun) {
        console.log(
            `  [dry-run] Would create ${weekCount} weekly insights (3 patterns each)`,
        );
        return;
    }

    if (withAi) {
        const { createWeeklyInsight, getWeekStart } = await import(
            "../lib/weekly-insights/service"
        );
        for (let w = 0; w < weekCount; w++) {
            const weekEntries = entries.slice(
                w * entriesPerWeek,
                (w + 1) * entriesPerWeek,
            );
            if (weekEntries.length < 2) continue;

            const weekStart = getWeekStart(new Date(weekEntries[0].createdAt));
            console.log(
                `  Week ${w + 1}/${weekCount} (${weekEntries.length} entries)...`,
            );

            try {
                const result = await createWeeklyInsight(userId, {
                    weekStart,
                    entryIds: weekEntries.map((e) => e.id),
                    entries: weekEntries.map((e) => ({
                        id: e.id,
                        content: e.content,
                        createdAt: e.createdAt,
                    })),
                });
                if ("error" in result) console.log(`    ❌ ${result.error}`);
                else
                    console.log(
                        `    ✓ ${result.data?.patterns?.length ?? 0} patterns`,
                    );
            } catch (e) {
                console.error(`    ❌ failed:`, e);
            }
            await new Promise((r) => setTimeout(r, 500));
        }
        return;
    }

    // Mock mode
    const { insertWeeklyInsight, createWeeklyInsightPatterns } = await import(
        "../lib/weekly-insights/repo"
    );

    for (let w = 0; w < weekCount; w++) {
        const weekEntries = entries.slice(
            w * entriesPerWeek,
            (w + 1) * entriesPerWeek,
        );
        if (weekEntries.length === 0) continue;

        process.stdout.write(`\r  Week ${w + 1}/${weekCount}`);

        // week_start = midnight of first entry in that week
        const weekStartDate = new Date(weekEntries[0].createdAt);
        weekStartDate.setHours(0, 0, 0, 0);

        const { data: weekly, error: weeklyError } = await insertWeeklyInsight(
            supabase,
            {
                userId,
                weekStart: weekStartDate.toISOString(),
                entryIds: weekEntries.map((e) => e.id),
            },
        );

        if (weeklyError || !weekly) {
            console.error(
                `\n  ❌ Weekly insight week ${w + 1} failed:`,
                weeklyError?.message,
            );
            continue;
        }

        const patternTemplates =
            MOCK_WEEKLY_PATTERNS[w % MOCK_WEEKLY_PATTERNS.length];

        const patternData = patternTemplates.map((p, pi) => ({
            title: p.title,
            patternType: p.patternType,
            description: p.description,
            // Each pattern cites 2 entries from that week as evidence
            evidence: [
                weekEntries[pi % weekEntries.length].id,
                weekEntries[(pi + 1) % weekEntries.length].id,
            ],
            question: p.question,
            suggestedExperiment: p.suggestedExperiment,
        }));

        const { error: patternsError } = await createWeeklyInsightPatterns(
            supabase,
            weekly.id,
            patternData,
        );

        if (patternsError) {
            console.error(
                `\n  ❌ Patterns week ${w + 1} failed:`,
                patternsError?.message,
            );
        }
    }

    console.log(`\n  ✓ ${weekCount} weekly insights with 3 patterns each`);
};

// ─── PHASE 4: PROGRESS INSIGHTS ───────────────────────────────────────────────

const seedProgressInsights = async (
    userId: string,
    entries: SeededEntry[],
    withAi: boolean,
    dryRun: boolean,
) => {
    const progressCount = Math.floor(entries.length / PROGRESS_INTERVAL);
    console.log(
        `\nPhase 4 — Progress Insights (Tier 3, ${progressCount} insights, ${withAi ? "AI" : "mock"})`,
    );

    if (dryRun) {
        console.log(
            `  [dry-run] Would create ${progressCount} progress insights`,
        );
        return;
    }

    if (progressCount === 0) {
        console.log("  (need at least 15 entries — skipping)");
        return;
    }

    if (withAi) {
        const { createProgressInsight } = await import(
            "../lib/progress-insights/service"
        );
        for (let i = 1; i <= progressCount; i++) {
            const recent = entries.slice(
                (i - 1) * PROGRESS_INTERVAL,
                i * PROGRESS_INTERVAL,
            );
            const past = entries
                .slice(0, (i - 1) * PROGRESS_INTERVAL)
                .slice(-7);

            console.log(`  Progress ${i}/${progressCount}...`);
            try {
                const result = await createProgressInsight(userId, {
                    recentEntryIds: recent.map((e) => e.id),
                    recentEntries: recent.map((e) => ({
                        id: e.id,
                        content: e.content,
                        createdAt: e.createdAt,
                    })),
                    relatedPastEntries: past.map((e) => ({
                        id: e.id,
                        content: e.content,
                        createdAt: e.createdAt,
                    })),
                });
                if ("error" in result) console.log(`    ❌ ${result.error}`);
                else console.log(`    ✓ created`);
            } catch (e) {
                console.error(`    ❌ failed:`, e);
            }
            await new Promise((r) => setTimeout(r, 500));
        }
        return;
    }

    // Mock mode
    const { insertProgressInsight } = await import(
        "../lib/progress-insights/repo"
    );

    for (let i = 1; i <= progressCount; i++) {
        process.stdout.write(`\r  Progress ${i}/${progressCount}`);

        const recent = entries.slice(
            (i - 1) * PROGRESS_INTERVAL,
            i * PROGRESS_INTERVAL,
        );
        // related past = last 7 entries before this batch (empty for first insight)
        const past = entries.slice(0, (i - 1) * PROGRESS_INTERVAL).slice(-7);

        const contentTemplate =
            MOCK_PROGRESS_CONTENT[(i - 1) % MOCK_PROGRESS_CONTENT.length];

        // key_entry_numbers [3, 8, 14] → indices 2, 7, 13 within recent
        const safeIdx = (n: number) => Math.min(n, recent.length - 1);
        const keyEntryIds = [
            recent[safeIdx(2)].id,
            recent[safeIdx(7)].id,
            recent[safeIdx(13)].id,
        ];

        const content = JSON.stringify({
            ...contentTemplate,
            is_milestone: i % 5 === 0,
        });

        const { data: insight, error } = await insertProgressInsight(supabase, {
            userId,
            content,
            recentEntryIds: recent.map((e) => e.id),
            relatedPastEntryIds: past.map((e) => e.id),
            keyEntryIds,
        });

        if (error) {
            console.error(`\n  ❌ Progress ${i} failed:`, error.message);
            continue;
        }

        // Backdate created_at to the date of the 15th entry in this batch
        // so the progress card appears at the right point in the timeline
        if (insight?.id) {
            const anchorDate = recent[recent.length - 1].createdAt;
            await supabase
                .from("progress_insights")
                .update({ created_at: anchorDate })
                .eq("id", insight.id);
        }
    }

    console.log(`\n  ✓ ${progressCount} progress insights created`);
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const main = async () => {
    const { userId, weeks, entriesPerWeek, clean, withAi, dryRun } =
        parseArgs();
    const total = weeks * entriesPerWeek;
    const progressCount = Math.floor(total / PROGRESS_INTERVAL);

    console.log("\n=== Unsaid User Seeder ===");
    console.log(`User:     ${userId}`);
    console.log(
        `History:  ${weeks} weeks × ${entriesPerWeek} entries = ${total} entries`,
    );
    console.log(
        `Weekly:   ${weeks} insights × 3 patterns = ${weeks * 3} patterns`,
    );
    console.log(`Progress: ${progressCount} insights (every 15 entries)`);
    console.log(
        `Mode:     ${withAi ? "AI generation" : "mock data (fast, no AI cost)"}`,
    );
    console.log(
        `Options:  ${[clean && "--clean", dryRun && "--dry-run"].filter(Boolean).join(" ") || "none"}\n`,
    );

    if (!dryRun) {
        await ensureUser(userId);
        if (clean) await cleanData(userId);
    }

    const entries = await seedEntries(userId, weeks, entriesPerWeek, dryRun);
    await seedEntryInsights(userId, entries, withAi, dryRun);
    await seedWeeklyInsights(userId, entries, entriesPerWeek, withAi, dryRun);
    await seedProgressInsights(userId, entries, withAi, dryRun);

    if (!dryRun) {
        await supabase.from("user_progress").upsert(
            {
                user_id: userId,
                total_entries: entries.length,
                entry_count_at_last_progress: entries.length,
            },
            { onConflict: "user_id" },
        );
        console.log("\n  ✓ user_progress updated");
    }

    console.log(`\n=== Done ===`);
    console.log(
        `${entries.length} entries | ${entries.length} insights | ${weeks} weekly cards | ${progressCount} progress cards`,
    );
    if (dryRun) console.log("\n[dry-run] No data written to DB.");
};

main().catch((err) => {
    console.error("Seeder failed:", err);
    process.exit(1);
});
