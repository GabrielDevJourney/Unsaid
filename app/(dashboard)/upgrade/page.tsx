import { auth } from "@clerk/nextjs/server";
import {
    Activity01Icon,
    AnonymousIcon,
    ArrowLeft01Icon,
    BookOpen01Icon,
    DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { LockedPreviewCard } from "@/components/entries/locked-preview-card";
import { EntryCard } from "@/components/home/entry-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { ProgressCard } from "@/components/progress/progress-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_INSIGHT_COUNT } from "@/lib/constants";
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
const GATE_BAR_FILL_PCT = 52;

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
                {/* Back link */}
                <Link
                    href="/entries/new"
                    className="mb-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                    Back
                </Link>

                {/* Hero */}
                <div className="mb-10 text-center">
                    <h1 className="font-serif text-4xl italic leading-tight text-neutral-500">
                        You&apos;ve been paying attention. So has Unsaid.
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Most journal apps help you write.{" "}
                        <strong>Unsaid helps you understand.</strong>
                    </p>
                </div>

                {/* Feature card grid — 15 cols × 54px, 7 rows × 64px */}
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
                                                entryNumber={
                                                    totalEntries - index
                                                }
                                                isPreview
                                            />
                                        ))}
                                    </div>
                                    {/* Foggy blur — backdrop-blur blurs actual card content */}
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
                                                    {
                                                        latestEntryInsight.insightCount
                                                    }
                                                    /{MAX_INSIGHT_COUNT}
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
                                    pattern={
                                        secondUpgradePattern ?? upgradePattern
                                    }
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

                <div className="my-10 border-t border-border" />

                {/* Pricing + CTA */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-4 w-full max-w-md">
                        <div className="flex-1 rounded-xl border border-neutral-200 bg-card px-5 py-4">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                                Monthly
                            </p>
                            <p className="font-serif text-3xl italic text-neutral-500">
                                $10.99
                            </p>
                            <p className="text-sm text-muted-foreground">
                                per month
                            </p>
                        </div>
                        <div className="relative flex-1 rounded-xl border border-transparent bg-card px-5 py-4 [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(to_right,rgb(148,163,184),rgba(148,163,184,0.9),rgba(251,146,60,0.6))_border-box]">
                            <span className="absolute -top-2.5 right-3 rounded-full bg-slate-200 border border-slate-400 px-2 py-0.5 text-xs text-slate-500">
                                Save 25%
                            </span>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                                Yearly
                            </p>
                            <p className="font-serif text-3xl italic text-neutral-500">
                                $99
                            </p>
                            <p className="text-sm text-muted-foreground">
                                $8.25/mo, billed annually
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="sunrise"
                        className="w-full max-w-md font-bold"
                    >
                        <Link href={CHECKOUT_URL}>Continue with Pro</Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Cancel anytime. Your entries are always yours.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
