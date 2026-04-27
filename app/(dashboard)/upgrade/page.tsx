import { auth } from "@clerk/nextjs/server";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { UpgradeFeatureGrid } from "@/components/upgrade/upgrade-feature-grid";
import { UpgradePricingSection } from "@/components/upgrade/upgrade-pricing-section";
import { getEntriesWithInsightsPaginated } from "@/lib/entries/service";
import { getTotalInsightsCount } from "@/lib/entry-insights/service";
import {
    getLatestProgressInsight,
    getProgressInsightsPaginated,
} from "@/lib/progress-insights/service";
import { createSupabaseServer } from "@/lib/supabase/server";
import { deriveUpgradePreviewData } from "@/lib/upgrade/utils";
import { getUserProgress } from "@/lib/users/service";
import { getWeeklyInsightWithPatternsPaginated } from "@/lib/weekly-insights/service";
import { isServiceError } from "@/types";

const UpgradePage = async () => {
    const { userId } = await auth();
    const supabase = await createSupabaseServer();

    const [
        progressResult,
        insightsCountResult,
        latestProgressInsightResult,
        weeklyInsightsResult,
        recentEntriesResult,
        olderProgressInsightsResult,
    ] = await Promise.all([
        getUserProgress(supabase),
        getTotalInsightsCount(supabase),
        userId
            ? getLatestProgressInsight(supabase, userId)
            : Promise.resolve({ data: null }),
        getWeeklyInsightWithPatternsPaginated(supabase, null, 2),
        getEntriesWithInsightsPaginated(supabase, 1, 4),
        userId
            ? getProgressInsightsPaginated(supabase, userId, 2, 1)
            : Promise.resolve({ data: { insights: [], count: 0 } }),
    ]);

    const progress = isServiceError(progressResult)
        ? null
        : progressResult.data;
    const insightsCount = isServiceError(insightsCountResult)
        ? 0
        : insightsCountResult.data;
    const latestProgressInsight = isServiceError(latestProgressInsightResult)
        ? null
        : latestProgressInsightResult.data;
    const weeklyInsights = isServiceError(weeklyInsightsResult)
        ? []
        : weeklyInsightsResult.data.insights;
    const recentEntries = isServiceError(recentEntriesResult)
        ? []
        : recentEntriesResult.data.entries;
    const olderProgressInsights = isServiceError(olderProgressInsightsResult)
        ? { insights: [], count: 0 }
        : olderProgressInsightsResult.data;

    const totalEntries = progress?.totalEntries ?? 0;

    const {
        upgradePattern,
        secondUpgradePattern,
        upgradeProgressInsight,
        latestEntryInsight,
    } = deriveUpgradePreviewData({
        weeklyInsights,
        olderProgressInsights: olderProgressInsights.insights,
        latestProgressInsight,
        recentEntries,
    });

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-8 py-12">
                <Link
                    href="/entries/new"
                    className="mb-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                    Back
                </Link>

                <div className="mb-10 text-center">
                    <h1 className="font-serif text-4xl italic leading-tight text-neutral-500">
                        You&apos;ve been paying attention. So has Unsaid.
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Most journal apps help you write.{" "}
                        <strong>Unsaid helps you understand.</strong>
                    </p>
                </div>

                <UpgradeFeatureGrid
                    recentEntries={recentEntries}
                    totalEntries={totalEntries}
                    insightsCount={insightsCount}
                    latestEntryInsight={latestEntryInsight}
                    upgradePattern={upgradePattern}
                    secondUpgradePattern={secondUpgradePattern}
                    upgradeProgressInsight={upgradeProgressInsight}
                />

                <UpgradePricingSection />
            </div>
        </div>
    );
};

export default UpgradePage;
