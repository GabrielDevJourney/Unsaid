import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEntriesWithInsightsPaginated } from "@/lib/entries/repo";
import {
    exportUserData,
    formatEntry,
    formatProgressInsight,
    formatWeeklyInsight,
} from "@/lib/exports/service";
import { findProgressInsightsPaginated } from "@/lib/progress-insights/repo";
import { findWeeklyInsightWithPatternsPaginated } from "@/lib/weekly-insights/repo";
import type { EntryWithInsight } from "@/types/domain/entries";
import type {
    ProgressInsight,
    WeeklyInsightWithPatterns,
} from "@/types/domain/insights";

vi.mock("@sentry/nextjs", () => ({
    withScope: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
}));

vi.mock("@/lib/entries/repo", () => ({
    getEntriesWithInsightsPaginated: vi.fn(),
}));

vi.mock("@/lib/weekly-insights/repo", () => ({
    findWeeklyInsightWithPatternsPaginated: vi.fn(),
}));

vi.mock("@/lib/progress-insights/repo", () => ({
    findProgressInsightsPaginated: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseEntry = (): EntryWithInsight => ({
    id: "entry-1",
    userId: "user-1",
    content: "Today I felt calm.",
    wordCount: 4,
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
    entryInsight: {
        id: "insight-1",
        content: "You're finding stillness.",
        tags: ["calm", "presence"],
        insightCount: 1,
        generationOrder: 1,
        contentBeforeLength: null,
        createdAt: "2026-03-10T01:00:00.000Z",
    },
});

const baseWeekly = (): WeeklyInsightWithPatterns => ({
    id: "weekly-1",
    userId: "user-1",
    weekStart: "2026-03-09T00:00:00.000Z",
    entryIds: ["entry-1"],
    createdAt: "2026-03-14T00:00:00.000Z",
    updatedAt: "2026-03-14T00:00:00.000Z",
    patterns: [
        {
            id: "pattern-1",
            weeklyInsightId: "weekly-1",
            title: "Stillness seeking",
            patternType: "recurring_theme",
            description: "You keep returning to stillness.",
            evidence: [],
            question: "What does stillness feel like in your body?",
            suggestedExperiment: "Sit with no input for 5 minutes.",
            createdAt: "2026-03-14T00:00:00.000Z",
            isViewed: false,
        },
    ],
});

const baseProgress = (): ProgressInsight => ({
    id: "progress-1",
    userId: "user-1",
    content: "Raw content fallback.",
    parsedContent: {
        headline: "You're building momentum.",
        whatsOnRepeat: "Anxiety before decisions.",
        whatChanged: "You asked for help twice.",
        realityCheck: "The fear was louder than the risk.",
        experiment: "Name the fear before acting.",
        theQuestion: "What would you do if you weren't afraid?",
        keyEntryNumbers: [1, 2],
    },
    isViewed: false,
    recentEntryIds: ["entry-1"],
    relatedPastEntryIds: null,
    keyEntryIds: null,
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-03-15T00:00:00.000Z",
});

const progressOk = (data: ProgressInsight[] = [baseProgress()]) => ({
    data,
    count: data.length,
    error: null,
});

const supabase = {} as SupabaseClient;
const userId = "user-test-1";

// ---------------------------------------------------------------------------
// formatEntry
// ---------------------------------------------------------------------------

describe("formatEntry", () => {
    it("renders date as a heading", () => {
        const result = formatEntry(baseEntry());
        expect(result).toContain("## Tuesday, March 10, 2026");
    });

    it("renders entry content", () => {
        const result = formatEntry(baseEntry());
        expect(result).toContain("Today I felt calm.");
    });

    it("renders insight content and themes when present", () => {
        const result = formatEntry(baseEntry());
        expect(result).toContain("**Unsaid's insight**");
        expect(result).toContain("You're finding stillness.");
        expect(result).toContain("*Themes: calm, presence*");
    });

    it("omits themes line when tags array is empty", () => {
        const entry = baseEntry();
        if (entry.entryInsight) entry.entryInsight.tags = [];
        const result = formatEntry(entry);
        expect(result).toContain("**Unsaid's insight**");
        expect(result).not.toContain("*Themes:");
    });

    it("renders placeholder when no insight", () => {
        const entry = baseEntry();
        entry.entryInsight = null;
        const result = formatEntry(entry);
        expect(result).toContain("*(No insight generated for this entry.)*");
        expect(result).not.toContain("**Unsaid's insight**");
    });

    it("ends with a horizontal rule", () => {
        const result = formatEntry(baseEntry());
        expect(result).toContain("---");
    });
});

// ---------------------------------------------------------------------------
// formatWeeklyInsight
// ---------------------------------------------------------------------------

describe("formatWeeklyInsight", () => {
    it("renders week heading with formatted date", () => {
        const result = formatWeeklyInsight(baseWeekly());
        expect(result).toContain("## Week of March 9");
    });

    it("renders pattern title and description", () => {
        const result = formatWeeklyInsight(baseWeekly());
        expect(result).toContain("### Stillness seeking");
        expect(result).toContain("You keep returning to stillness.");
    });

    it("renders question and experiment", () => {
        const result = formatWeeklyInsight(baseWeekly());
        expect(result).toContain(
            "*Something to sit with:* What does stillness feel like in your body?",
        );
        expect(result).toContain(
            "*Try this:* Sit with no input for 5 minutes.",
        );
    });

    it("uses fallback text when question is null", () => {
        const weekly = baseWeekly();
        weekly.patterns[0].question = null;
        const result = formatWeeklyInsight(weekly);
        expect(result).toContain(
            "*Something to sit with:* *(Not available for this pattern.)*",
        );
    });

    it("uses fallback text when suggestedExperiment is null", () => {
        const weekly = baseWeekly();
        weekly.patterns[0].suggestedExperiment = null;
        const result = formatWeeklyInsight(weekly);
        expect(result).toContain(
            "*Try this:* *(Not available for this pattern.)*",
        );
    });

    it("returns empty string when patterns array is empty", () => {
        const weekly = baseWeekly();
        weekly.patterns = [];
        expect(formatWeeklyInsight(weekly)).toBe("");
    });

    it("renders all patterns when multiple exist", () => {
        const weekly = baseWeekly();
        weekly.patterns.push({
            ...weekly.patterns[0],
            id: "pattern-2",
            title: "Avoidance loop",
        });
        const result = formatWeeklyInsight(weekly);
        expect(result).toContain("### Stillness seeking");
        expect(result).toContain("### Avoidance loop");
    });
});

// ---------------------------------------------------------------------------
// formatProgressInsight
// ---------------------------------------------------------------------------

describe("formatProgressInsight", () => {
    it("renders date as a heading", () => {
        const result = formatProgressInsight(baseProgress());
        expect(result).toContain("## March 15, 2026");
    });

    it("renders all structured fields when parsedContent exists", () => {
        const result = formatProgressInsight(baseProgress());
        expect(result).toContain("**You're building momentum.**");
        expect(result).toContain(
            "**What's on repeat:** Anxiety before decisions.",
        );
        expect(result).toContain("**What changed:** You asked for help twice.");
        expect(result).toContain(
            "**Reality check:** The fear was louder than the risk.",
        );
        expect(result).toContain(
            "**Experiment:** Name the fear before acting.",
        );
        expect(result).toContain(
            "**The question:** What would you do if you weren't afraid?",
        );
    });

    it("falls back to raw content when parsedContent is null", () => {
        const insight = baseProgress();
        insight.parsedContent = null;
        const result = formatProgressInsight(insight);
        expect(result).toContain("Raw content fallback.");
        expect(result).not.toContain("**What's on repeat:**");
    });

    it("ends with a horizontal rule", () => {
        expect(formatProgressInsight(baseProgress())).toContain("---");
    });
});

// ---------------------------------------------------------------------------
// exportUserData — happy path
// ---------------------------------------------------------------------------

describe("exportUserData — happy path", () => {
    beforeEach(() => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [baseEntry()],
            count: 1,
            error: null,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [baseWeekly()],
            nextCursor: null,
            error: null,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk(),
        );
    });

    it("returns skippedBatchCount of 0", async () => {
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(0);
    });

    it("includes document title and entry count", async () => {
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain("# Unsaid Journal");
        expect(content).toContain("1 entry");
    });

    it("uses singular 'entry' for count of 1", async () => {
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain("1 entry");
        expect(content).not.toContain("1 entries");
    });

    it("uses plural 'entries' for count > 1", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [baseEntry(), { ...baseEntry(), id: "entry-2" }],
            count: 2,
            error: null,
        });
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain("2 entries");
    });

    it("includes all three sections", async () => {
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain("Today I felt calm.");
        expect(content).toContain("# Weekly Patterns");
        expect(content).toContain("# Progress Insights");
    });

    it("does not include warning block when no errors", async () => {
        const { content } = await exportUserData(supabase, userId);
        expect(content).not.toContain("Some entries could not be read");
    });
});

// ---------------------------------------------------------------------------
// exportUserData — empty user
// ---------------------------------------------------------------------------

describe("exportUserData — empty user", () => {
    beforeEach(() => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: null,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [],
            nextCursor: null,
            error: null,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk([]),
        );
    });

    it("returns skippedBatchCount of 0", async () => {
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(0);
    });

    it("shows 0 entries in header", async () => {
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain("0 entries");
    });

    it("omits section headers when no data", async () => {
        const { content } = await exportUserData(supabase, userId);
        expect(content).not.toContain("# Weekly Patterns");
        expect(content).not.toContain("# Progress Insights");
    });
});

// ---------------------------------------------------------------------------
// exportUserData — pagination
// ---------------------------------------------------------------------------

describe("exportUserData — pagination", () => {
    it("fetches page 2 when page 1 returns a full batch of 100", async () => {
        const fullBatch = Array.from({ length: 100 }, (_, i) => ({
            ...baseEntry(),
            id: `entry-${i}`,
        }));
        vi.mocked(getEntriesWithInsightsPaginated)
            .mockResolvedValueOnce({ data: fullBatch, count: 110, error: null })
            .mockResolvedValueOnce({
                data: [{ ...baseEntry(), id: "entry-100" }],
                count: 110,
                error: null,
            });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [],
            nextCursor: null,
            error: null,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk([]),
        );

        await exportUserData(supabase, userId);

        expect(getEntriesWithInsightsPaginated).toHaveBeenCalledTimes(2);
        expect(getEntriesWithInsightsPaginated).toHaveBeenNthCalledWith(
            2,
            supabase,
            2,
            100,
        );
    });

    it("passes cursor from first weekly batch to second", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: null,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated)
            .mockResolvedValueOnce({
                data: [baseWeekly()],
                nextCursor: "cursor-abc",
                error: null,
            })
            .mockResolvedValueOnce({
                data: [baseWeekly()],
                nextCursor: null,
                error: null,
            });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk([]),
        );

        await exportUserData(supabase, userId);

        expect(findWeeklyInsightWithPatternsPaginated).toHaveBeenCalledTimes(2);
        expect(findWeeklyInsightWithPatternsPaginated).toHaveBeenNthCalledWith(
            2,
            supabase,
            "cursor-abc",
            25,
        );
    });

    it("stops fetching when batch is smaller than batch size", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [baseEntry()],
            count: 1,
            error: null,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [],
            nextCursor: null,
            error: null,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk([]),
        );

        await exportUserData(supabase, userId);

        expect(getEntriesWithInsightsPaginated).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------
// exportUserData — error handling & skippedBatchCount
// ---------------------------------------------------------------------------

describe("exportUserData — error handling", () => {
    const supabaseError = { message: "DB timeout", code: "500" } as never;

    beforeEach(() => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [baseEntry()],
            count: 1,
            error: null,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [baseWeekly()],
            nextCursor: null,
            error: null,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk(),
        );
    });

    it("entries query error increments skippedBatchCount", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: supabaseError,
        });
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(1);
    });

    it("weekly query error increments skippedBatchCount", async () => {
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [],
            nextCursor: null,
            error: supabaseError,
        });
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(1);
    });

    it("progress query error increments skippedBatchCount", async () => {
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: supabaseError,
        });
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(1);
    });

    it("all three domains erroring gives skippedBatchCount of 3", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: supabaseError,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [],
            nextCursor: null,
            error: supabaseError,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: supabaseError,
        });
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(3);
    });

    it("warning block appears in content when skippedBatchCount > 0", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: supabaseError,
        });
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain(
            "Some entries could not be read and were skipped.",
        );
        expect(content).toContain(
            "Your data is still in Unsaid — contact support to recover them.",
        );
    });

    it("entries throw increments skippedBatchCount", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            new Error("network failure"),
        );
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(1);
    });

    it("weekly throw increments skippedBatchCount", async () => {
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockRejectedValue(
            new Error("network failure"),
        );
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(1);
    });

    it("progress throw increments skippedBatchCount", async () => {
        vi.mocked(findProgressInsightsPaginated).mockRejectedValue(
            new Error("network failure"),
        );
        const { skippedBatchCount } = await exportUserData(supabase, userId);
        expect(skippedBatchCount).toBe(1);
    });

    it("entries error still exports weekly and progress", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: supabaseError,
        });
        const { content } = await exportUserData(supabase, userId);
        expect(content).toContain("# Weekly Patterns");
        expect(content).toContain("# Progress Insights");
    });
});

// ---------------------------------------------------------------------------
// exportUserData — Sentry
// ---------------------------------------------------------------------------

describe("exportUserData — Sentry error tracking", () => {
    const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn(),
        setFingerprint: vi.fn(),
    };

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(Sentry.withScope).mockImplementation(((
            cb: (scope: typeof mockScope) => void,
        ) => cb(mockScope)) as never);
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: null,
        });
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockResolvedValue({
            data: [],
            nextCursor: null,
            error: null,
        });
        vi.mocked(findProgressInsightsPaginated).mockResolvedValue(
            progressOk([]),
        );
    });

    it("calls captureException when an Error is thrown", async () => {
        const err = new Error("transformer crash");
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(err);

        await exportUserData(supabase, userId);

        expect(Sentry.captureException).toHaveBeenCalledWith(err);
    });

    it("calls captureMessage when a non-Error is thrown", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            "string error",
        );

        await exportUserData(supabase, userId);

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
            "export: entries batch failed",
            { level: "error" },
        );
    });

    it("sets feature=export tag on every error", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setTag).toHaveBeenCalledWith("feature", "export");
    });

    it("sets correct domain tag for entries error", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setTag).toHaveBeenCalledWith(
            "export.domain",
            "entries",
        );
    });

    it("sets correct domain tag for weekly error", async () => {
        vi.mocked(findWeeklyInsightWithPatternsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setTag).toHaveBeenCalledWith(
            "export.domain",
            "weekly",
        );
    });

    it("sets correct domain tag for progress error", async () => {
        vi.mocked(findProgressInsightsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setTag).toHaveBeenCalledWith(
            "export.domain",
            "progress",
        );
    });

    it("sets fingerprint to [export-failure, domain]", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setFingerprint).toHaveBeenCalledWith([
            "export-failure",
            "entries",
        ]);
    });

    it("includes userId in Sentry context", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setContext).toHaveBeenCalledWith(
            "export",
            expect.objectContaining({ userId }),
        );
    });

    it("sets error_type=transformer_error on throws", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockRejectedValue(
            new Error("fail"),
        );

        await exportUserData(supabase, userId);

        expect(mockScope.setTag).toHaveBeenCalledWith(
            "export.error_type",
            "transformer_error",
        );
    });

    it("sets error_type=query_error on Supabase error response", async () => {
        vi.mocked(getEntriesWithInsightsPaginated).mockResolvedValue({
            data: [],
            count: 0,
            error: { message: "query failed", code: "500" } as never,
        });

        await exportUserData(supabase, userId);

        expect(mockScope.setTag).toHaveBeenCalledWith(
            "export.error_type",
            "query_error",
        );
    });
});
