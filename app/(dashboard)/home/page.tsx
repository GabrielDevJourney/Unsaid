"use client";

import type { TagName } from "@/components/home/entry-tag";
import { HomeView } from "@/components/home/home-view";
import type { EntryWithInsight } from "@/types";

interface MockEntry {
    entry: EntryWithInsight;
    tags: TagName[];
}

const MOCK_ENTRIES: MockEntry[] = [
    {
        entry: {
            id: "e1",
            userId: "u1",
            content:
                "That's exactly why I love peace. In the end we're only beings stuck in such a small period of time. Why get worked up for things that really matter when the universe is so vast and indifferent to our daily struggles.",
            wordCount: 38,
            createdAt: "2025-01-31T20:00:00Z",
            updatedAt: "2025-01-31T20:00:00Z",
            entryInsight: {
                id: "i1",
                content:
                    "You're exploring a theme of acceptance and perspective. This entry shows a desire to detach from petty concerns and find meaning in the bigger picture — a sign of emotional maturity.",
                createdAt: "2025-01-31T20:05:00Z",
            },
        },
        tags: ["Relationships", "Self-Worth"],
    },
    {
        entry: {
            id: "e2",
            userId: "u1",
            content:
                "I've been thinking about what it means to truly connect with someone. It's not about the grand gestures but the quiet moments where you feel seen and understood without needing to explain yourself.",
            wordCount: 35,
            createdAt: "2025-01-29T19:30:00Z",
            updatedAt: "2025-01-29T19:30:00Z",
            entryInsight: {
                id: "i2",
                content:
                    "There's a recurring need for authentic connection in your writing. You value being understood over being impressed — this clarity can guide you toward deeper relationships.",
                createdAt: "2025-01-29T19:35:00Z",
            },
        },
        tags: ["Loneliness", "Purpose"],
    },
    {
        entry: {
            id: "e3",
            userId: "u1",
            content:
                "Today I realized that the goals I've been chasing aren't really mine. They belong to a version of me that was trying to impress people who don't even matter anymore. Time to recalibrate.",
            wordCount: 33,
            createdAt: "2025-01-28T18:00:00Z",
            updatedAt: "2025-01-28T18:00:00Z",
            entryInsight: {
                id: "i3",
                content:
                    "A powerful moment of self-awareness. You're distinguishing between externally motivated goals and internally meaningful ones — this shift often precedes significant personal growth.",
                createdAt: "2025-01-28T18:05:00Z",
            },
        },
        tags: ["Relationships", "Goals"],
    },
    {
        entry: {
            id: "e4",
            userId: "u1",
            content:
                "Made a tough call at work today. Turned down the promotion because it would mean sacrificing the things that actually bring me joy. Everyone thinks I'm crazy but it felt right in my gut.",
            wordCount: 34,
            createdAt: "2025-01-27T21:00:00Z",
            updatedAt: "2025-01-27T21:00:00Z",
            entryInsight: {
                id: "i4",
                content:
                    "You're prioritizing alignment over achievement. Trusting your gut despite external pressure shows growing confidence in your own values. Notice how this decision felt in your body.",
                createdAt: "2025-01-27T21:05:00Z",
            },
        },
        tags: ["Decision", "Habits"],
    },
    {
        entry: {
            id: "e5",
            userId: "u1",
            content:
                "Woke up anxious again. The same loop of thoughts circling around money and whether I'm doing enough. Journaling helps me see that these fears are patterns, not predictions.",
            wordCount: 31,
            createdAt: "2025-01-25T08:00:00Z",
            updatedAt: "2025-01-25T08:00:00Z",
            entryInsight: {
                id: "i5",
                content:
                    "You're building self-awareness around your anxiety triggers. Recognizing that fears are patterns rather than predictions is a powerful cognitive reframe — keep noticing this distinction.",
                createdAt: "2025-01-25T08:05:00Z",
            },
        },
        tags: ["Anxiety", "Money"],
    },
    {
        entry: {
            id: "e6",
            userId: "u1",
            content:
                "Had a long walk in the park and just let my mind wander. No podcasts, no music, just the sound of leaves and my own breathing. I need more of this stillness in my life.",
            wordCount: 33,
            createdAt: "2025-01-23T17:00:00Z",
            updatedAt: "2025-01-23T17:00:00Z",
            entryInsight: {
                id: "i6",
                content:
                    "You're recognizing a need for unstructured quiet time. This craving for stillness often surfaces when life becomes overstimulating — consider making this a regular practice.",
                createdAt: "2025-01-23T17:05:00Z",
            },
        },
        tags: ["Health", "Growth"],
    },
    {
        entry: {
            id: "e7",
            userId: "u1",
            content:
                "My sister called today after weeks of silence. We talked for two hours about nothing and everything. I forgot how much her laugh sounds like mom's. Some bonds don't need maintenance to stay strong.",
            wordCount: 34,
            createdAt: "2025-01-21T19:00:00Z",
            updatedAt: "2025-01-21T19:00:00Z",
            entryInsight: {
                id: "i7",
                content:
                    "Family connections resurface as a source of comfort. The comparison to your mother suggests a deepening appreciation for inherited traits and continuity across generations.",
                createdAt: "2025-01-21T19:05:00Z",
            },
        },
        tags: ["Family", "Relationships"],
    },
    {
        entry: {
            id: "e8",
            userId: "u1",
            content:
                "I keep setting boundaries and then feeling guilty about it. Said no to a friend's event because I needed rest. The guilt is loud but the relief underneath it is louder. Progress isn't always comfortable.",
            wordCount: 35,
            createdAt: "2025-01-19T21:30:00Z",
            updatedAt: "2025-01-19T21:30:00Z",
            entryInsight: {
                id: "i8",
                content:
                    "You're learning to tolerate the discomfort that comes with healthy boundaries. Noticing the relief beneath the guilt shows you're building a new emotional baseline — the guilt will quiet over time.",
                createdAt: "2025-01-19T21:35:00Z",
            },
        },
        tags: ["Boundaries", "Growth"],
    },
    {
        entry: {
            id: "e9",
            userId: "u1",
            content:
                "Started reading again before bed instead of scrolling. Only three pages but it felt like reclaiming something I'd lost. Small changes, compounding. That's the whole game isn't it.",
            wordCount: 30,
            createdAt: "2025-01-17T22:00:00Z",
            updatedAt: "2025-01-17T22:00:00Z",
            entryInsight: {
                id: "i9",
                content:
                    "You're replacing a numbing habit with a nourishing one. The awareness that small changes compound shows a mature understanding of how lasting transformation actually works.",
                createdAt: "2025-01-17T22:05:00Z",
            },
        },
        tags: ["Habits", "Creativity"],
    },
    {
        entry: {
            id: "e10",
            userId: "u1",
            content:
                "Money stress hit different today. Not the panic kind but the planning kind. I actually sat down and looked at numbers instead of avoiding them. Turns out reality is less scary than imagination.",
            wordCount: 32,
            createdAt: "2025-01-15T10:00:00Z",
            updatedAt: "2025-01-15T10:00:00Z",
            entryInsight: {
                id: "i10",
                content:
                    "A shift from avoidance to engagement with financial reality. Moving from panic to planning is a significant behavioral change — confronting what we fear often dissolves its power.",
                createdAt: "2025-01-15T10:05:00Z",
            },
        },
        tags: ["Money", "Anxiety"],
    },
    {
        entry: {
            id: "e11",
            userId: "u1",
            content:
                "Feeling stuck at work again. Not because it's hard but because it doesn't challenge me anymore. I'm comfortable and that's starting to feel like a warning sign rather than a reward.",
            wordCount: 31,
            createdAt: "2025-01-13T18:00:00Z",
            updatedAt: "2025-01-13T18:00:00Z",
            entryInsight: {
                id: "i11",
                content:
                    "Comfort as a warning sign — you're recognizing stagnation. This restlessness often signals readiness for a new chapter. Consider what challenge would re-engage your sense of purpose.",
                createdAt: "2025-01-13T18:05:00Z",
            },
        },
        tags: ["Work", "Identity"],
    },
    {
        entry: {
            id: "e12",
            userId: "u1",
            content:
                "Grief doesn't follow a schedule. Three years later and a song in the grocery store can still stop me in my tracks. I'm learning that healing doesn't mean forgetting. It means carrying it differently.",
            wordCount: 35,
            createdAt: "2025-01-11T20:00:00Z",
            updatedAt: "2025-01-11T20:00:00Z",
            entryInsight: {
                id: "i12",
                content:
                    "You're redefining what healing looks like — not as erasure but as integration. This is a profound reframe that suggests deep emotional processing and acceptance of loss as part of your story.",
                createdAt: "2025-01-11T20:05:00Z",
            },
        },
        tags: ["Loss", "Change"],
    },
];

const TOTAL_ENTRIES = MOCK_ENTRIES.length + 11;

const HomePage = () => {
    return (
        <HomeView
            entries={MOCK_ENTRIES}
            totalEntries={TOTAL_ENTRIES}
            userName="Cat"
        />
    );
};

export default HomePage;
