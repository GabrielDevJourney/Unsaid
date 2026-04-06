import {
    Activity01Icon,
    AnonymousIcon,
    BookOpen01Icon,
    DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { LockedPreviewCard } from "@/components/entries/locked-preview-card";
import { EntryCard } from "@/components/home/entry-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { ProgressCard } from "@/components/progress/progress-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
import type {
    EntryInsightSummary,
    EntryWithInsight,
    ProgressInsight,
    WeeklyInsightPattern,
} from "@/types";

const GATE_BAR_FILL_PCT = 52;

interface UpgradeFeatureGridProps {
    recentEntries: EntryWithInsight[] | null;
    totalEntries: number;
    insightsCount: number | null;
    latestEntryInsight: EntryInsightSummary | null;
    upgradePattern: WeeklyInsightPattern | null;
    secondUpgradePattern: WeeklyInsightPattern | null;
    upgradeProgressInsight: ProgressInsight | null;
}

const UpgradeFeatureGrid = ({
    recentEntries,
    totalEntries,
    insightsCount,
    latestEntryInsight,
    upgradePattern,
    secondUpgradePattern,
    upgradeProgressInsight,
}: UpgradeFeatureGridProps) => {
    const latestPattern = upgradePattern;

    return (
        <div className="grid grid-cols-[repeat(15,54px)] gap-4 grid-rows-[repeat(7,64px)]">
            {/* Unlimited Entries — cols 1-10, rows 1-3 — custom 2-col layout */}
            <div className="col-span-10 row-span-3 h-full rounded-xl border border-neutral-300 bg-[#D9D9D9]/30 overflow-hidden flex">
                {/* Left: icon + title + subtitle */}
                <div className="px-5 pt-5 w-[38%] shrink-0 flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="bg-white border border-border rounded-md p-1.5">
                            <HugeiconsIcon
                                icon={BookOpen01Icon}
                                strokeWidth={1}
                                className="size-5 text-neutral-400"
                            />
                        </div>
                    </div>
                    <h3 className="mt-2 font-serif text-md italic text-neutral-500">
                        Unlimited Entries
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 leading-snug">
                        {latestPattern
                            ? `${latestPattern.title} keeps coming up. Write about it. Write about everything.`
                            : "No entry count. No cutoff. Just write."}
                    </p>
                </div>
                {/* Right: scaled real EntryCards */}
                <div className="relative flex-1 overflow-hidden pt-8">
                    {recentEntries && recentEntries.length > 0 ? (
                        <>
                            <div className="origin-top-left scale-x-[0.42] scale-y-[0.39] w-[280%] pt-2 grid grid-cols-2 gap-4 pointer-events-none">
                                {recentEntries.map((entry, index) => (
                                    <EntryCard
                                        key={entry.id}
                                        entry={entry}
                                        entryNumber={totalEntries - index}
                                        isPreview
                                    />
                                ))}
                            </div>
                            <div
                                className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                                style={{
                                    backdropFilter: "blur(2px)",
                                    WebkitBackdropFilter: "blur(2px)",
                                    maskImage:
                                        "linear-gradient(to bottom, transparent, black 50%)",
                                    WebkitMaskImage:
                                        "linear-gradient(to bottom, transparent, black 40%)",
                                }}
                            />
                        </>
                    ) : (
                        <Skeleton className="m-3 h-full rounded-xl" />
                    )}
                </div>
            </div>

            {/* End-to-end Encryption — cols 11-15, rows 1-2 */}
            <div className="col-start-11 col-span-5 row-span-2 flex flex-col justify-center rounded-xl border border-neutral-300 bg-[#D9D9D9]/30 overflow-hidden h-full px-5 py-6">
                <div className="bg-white border border-border rounded-md p-1.5 w-fit">
                    <HugeiconsIcon
                        icon={AnonymousIcon}
                        strokeWidth={1}
                        className="size-5 text-neutral-400"
                    />
                </div>
                <h3 className="mt-3 font-serif text-md italic text-neutral-500">
                    End-to-end encryption
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 leading-snug">
                    Only you can read this. Not us. Not anyone.
                </p>
            </div>

            {/* Entry Insights — cols 1-4, rows 4-7 */}
            <div className="col-start-1 col-span-4 row-start-4 row-span-4 flex flex-col rounded-xl border border-neutral-300 bg-[#D9D9D9]/30 overflow-hidden h-full">
                <div className="px-5 pt-5">
                    <div className="flex items-center justify-between">
                        <div className="bg-white border border-border rounded-md p-1.5 min-w-8.5 min-h-8.5 flex items-center justify-center">
                            <Image
                                src="/logo-benefits-entry-insights-pen.svg"
                                alt=""
                                width={16}
                                height={16}
                            />
                        </div>
                    </div>
                    <h3 className="mt-2 font-serif text-md italic text-neutral-500">
                        Entry Insights
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 leading-snug">
                        {insightsCount && totalEntries
                            ? `${insightsCount} insights across your ${totalEntries} entries.`
                            : "Every entry surfaces what you actually said — not what you think you said."}
                    </p>
                </div>
                <div className="relative mt-3 flex-1 min-h-0 overflow-hidden pointer-events-none">
                    {latestEntryInsight ? (
                        <div className="mx-3 h-full flex flex-col gap-3">
                            <div className="flex-1 min-h-0 rounded-xl border flex flex-col bg-card">
                                <div className="flex gap-2 items-center border-b py-6 px-4">
                                    <span className="font-serif text-2xl italic text-zinc-600">
                                        Insight
                                    </span>
                                    <div className="bg-neutral-200 rounded-xl w-9 h-5 flex items-center justify-center">
                                        <span className="text-xs text-neutral-500">
                                            {latestEntryInsight.insightCount}/
                                            {MAX_INSIGHT_COUNT}
                                        </span>
                                    </div>
                                </div>
                                <p className="flex-1 min-h-0 overflow-y-auto text-base text-neutral-600 leading-6 p-4 font-sans">
                                    {latestEntryInsight.content}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Skeleton className="mx-3 h-full rounded-xl" />
                    )}
                    <div
                        className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                        style={{
                            backdropFilter: "blur(2px)",
                            WebkitBackdropFilter: "blur(2px)",
                            maskImage:
                                "linear-gradient(to bottom, transparent, black 50%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, transparent, black 40%)",
                        }}
                    />
                </div>
            </div>

            {/* Weekly Patterns — cols 5-10, rows 4-7 */}
            <LockedPreviewCard
                icon={DashboardSquare01Icon}
                title="Weekly Patterns"
                showLock={false}
                titleSize="md"
                subtitle={
                    upgradePattern
                        ? `${upgradePattern.title} surfaced this week. More patterns are already forming.`
                        : "Every week, the themes in your writing get named."
                }
                className="col-start-5 col-span-6 row-start-4 row-span-4 h-full"
            >
                {upgradePattern ? (
                    <div className="ml-8 origin-top-left scale-[0.6] w-[160%] flex flex-col gap-4">
                        <PatternCard
                            pattern={upgradePattern}
                            from="/patterns"
                            isPreview
                        />
                        <PatternCard
                            pattern={secondUpgradePattern ?? upgradePattern}
                            from="/patterns"
                            isPreview
                        />
                    </div>
                ) : (
                    <Skeleton className="mx-3 h-full rounded-xl" />
                )}
            </LockedPreviewCard>

            {/* Progress Tracking — cols 11-15, rows 3-7 */}
            <LockedPreviewCard
                icon={Activity01Icon}
                title="Progress Tracking"
                showLock={false}
                titleSize="md"
                subtitle="A deeper read, every 15 entries. Yours is waiting."
                extra={
                    <div className="relative h-1 rounded-full bg-neutral-300 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full bg-slate-400 overflow-hidden"
                            style={{ width: `${GATE_BAR_FILL_PCT}%` }}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(251,146,60,0.75)_5%,rgba(255,115,1,0.45)_20%,transparent_55%)]" />
                        </div>
                    </div>
                }
                className="col-start-11 col-span-5 row-start-3 row-span-5 h-full gap-6"
            >
                {upgradeProgressInsight ? (
                    <div className="origin-top-left scale-[0.8] w-[200%] ml-5">
                        <ProgressCard
                            insight={upgradeProgressInsight}
                            isPreview
                        />
                    </div>
                ) : (
                    <Skeleton className="mx-3 h-full rounded-xl" />
                )}
            </LockedPreviewCard>
        </div>
    );
};

export { UpgradeFeatureGrid, type UpgradeFeatureGridProps };
