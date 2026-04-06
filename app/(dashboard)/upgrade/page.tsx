import { auth } from "@clerk/nextjs/server";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { UpgradeFeatureGrid } from "@/components/upgrade/upgrade-feature-grid";
import { UpgradePricingSection } from "@/components/upgrade/upgrade-pricing-section";
import { getEntriesWithInsightsPaginated } from "@/lib/entries/repo";
import { getTotalInsightsCount } from "@/lib/entry-insights/repo";
import {
    getLatestProgressInsight,
    getProgressInsightsPaginated,
} from "@/lib/progress-insights/repo";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserProgress } from "@/lib/users/repo";
import { getWeeklyInsightWithPatternsPaginated } from "@/lib/weekly-insights/repo";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "#";

const UpgradePage = async () => {
    const { userId } = await auth();
    const supabase = await createSupabaseServer();

    const [
        { data: progress },
        { count: insightsCount },
        { data: latestProgressInsight },
        { data: weeklyInsights },
        { data: recentEntries },
        { data: olderProgressInsights },
    ] = await Promise.all([
        getUserProgress(supabase),
        getTotalInsightsCount(supabase),
        userId
            ? getLatestProgressInsight(supabase, userId)
            : Promise.resolve({ data: null, error: null }),
        getWeeklyInsightWithPatternsPaginated(supabase, null, 2),
        getEntriesWithInsightsPaginated(supabase, 1, 4),
        userId
            ? getProgressInsightsPaginated(supabase, userId, 2, 1)
            : Promise.resolve({ data: [], error: null, count: 0 }),
    ]);

    const totalEntries = progress?.totalEntries ?? 0;

    // Gate shows patterns[0] — upgrade page shows distinct pattern
    const latestPattern = weeklyInsights?.[0]?.patterns?.[0] ?? null;
    const upgradePattern =
        weeklyInsights?.[1]?.patterns?.[0] ??
        weeklyInsights?.[0]?.patterns?.[2] ??
        weeklyInsights?.[0]?.patterns?.[1] ??
        latestPattern;

    // Gate shows latestProgressInsight — upgrade page shows second-most-recent
    const upgradeProgressInsight =
        olderProgressInsights?.[0] ?? latestProgressInsight ?? null;

    const secondUpgradePattern =
        weeklyInsights?.[1]?.patterns?.[1] ??
        weeklyInsights?.[0]?.patterns?.[2] ??
        weeklyInsights?.[0]?.patterns?.[1] ??
        upgradePattern;

    const latestEntryInsight = recentEntries?.[0]?.entryInsight ?? null;

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

                <UpgradePricingSection checkoutUrl={CHECKOUT_URL} />
            </div>
        </div>
    );
};

export default UpgradePage;
