import type {
    EntryInsightSummary,
    EntryWithInsight,
    ProgressInsight,
    WeeklyInsightPattern,
    WeeklyInsightWithPatterns,
} from "@/types";

interface UpgradePreviewData {
    upgradePattern: WeeklyInsightPattern | null;
    secondUpgradePattern: WeeklyInsightPattern | null;
    upgradeProgressInsight: ProgressInsight | null;
    latestEntryInsight: EntryInsightSummary | null;
}

const deriveUpgradePreviewData = ({
    weeklyInsights,
    olderProgressInsights,
    latestProgressInsight,
    recentEntries,
}: {
    weeklyInsights: WeeklyInsightWithPatterns[] | null;
    olderProgressInsights: ProgressInsight[] | null;
    latestProgressInsight: ProgressInsight | null;
    recentEntries: EntryWithInsight[] | null;
}): UpgradePreviewData => {
    const latestPattern = weeklyInsights?.[0]?.patterns?.[0] ?? null;

    // Gate shows patterns[0] — upgrade page shows distinct pattern
    const upgradePattern =
        weeklyInsights?.[1]?.patterns?.[0] ??
        weeklyInsights?.[0]?.patterns?.[2] ??
        weeklyInsights?.[0]?.patterns?.[1] ??
        latestPattern;

    const secondUpgradePattern =
        weeklyInsights?.[1]?.patterns?.[1] ??
        weeklyInsights?.[0]?.patterns?.[2] ??
        weeklyInsights?.[0]?.patterns?.[1] ??
        upgradePattern;

    // Gate shows latestProgressInsight — upgrade page shows second-most-recent
    const upgradeProgressInsight =
        olderProgressInsights?.[0] ?? latestProgressInsight ?? null;

    const latestEntryInsight = recentEntries?.[0]?.entryInsight ?? null;

    return {
        upgradePattern,
        secondUpgradePattern,
        upgradeProgressInsight,
        latestEntryInsight,
    };
};

export { deriveUpgradePreviewData, type UpgradePreviewData };
