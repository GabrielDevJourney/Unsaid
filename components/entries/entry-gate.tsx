import {
    Activity01Icon,
    ArrowLeft01Icon,
    DashboardSquare01Icon,
    SquareLock02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { PatternCard } from "@/components/patterns/pattern-card";
import { ProgressCard } from "@/components/progress/progress-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProgressInsight, WeeklyInsightPattern } from "@/types";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "#";

// Teaser fill for the gate — shows what the bar looks like, not real progress
const GATE_BAR_FILL_PCT = 52;

interface EntryGateProps {
    totalEntries: number;
    patternsCount: number;
    insightsCount: number;
    latestProgressInsight: ProgressInsight | null;
    latestPattern: WeeklyInsightPattern | null;
    secondLatestPattern: WeeklyInsightPattern | null;
}

const StatCell = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-1 flex-col items-center gap-1 px-6 py-5">
        <span className="text-sm text-neutral-500">{label}</span>
        <span className="font-serif text-4xl italic  text-neutral-500">
            {String(value).padStart(2, "0")}
        </span>
    </div>
);

const LockedPreviewCard = ({
    icon,
    title,
    subtitle,
    extra,
    children,
}: {
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
    title: string;
    subtitle: React.ReactNode;
    extra?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col rounded-xl border border-neutral-300 bg-[#D9D9D9]/30 overflow-hidden min-w-50 h-70">
        <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
                <div className="bg-white border border-border rounded-md p-1.5">
                    <HugeiconsIcon
                        icon={icon}
                        strokeWidth={1}
                        className="size-5 text-neutral-500"
                    />
                </div>
                <HugeiconsIcon
                    icon={SquareLock02Icon}
                    className="size-4 text-neutral-400"
                />
            </div>
            <h3 className="mt-2 font-serif text-xl italic text-neutral-500">
                {title}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-snug">
                {subtitle}
            </p>
        </div>
        {extra && <div className="px-5 pt-3">{extra}</div>}
        <div className="relative mt-4 flex-1 min-h-0 overflow-hidden pointer-events-none">
            {children}
            <div className="absolute bottom-0 inset-x-0 h-6.25 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent from-50% to-card" />
        </div>
    </div>
);

const EntryGate = ({
    totalEntries,
    patternsCount,
    insightsCount,
    latestProgressInsight,
    latestPattern,
    secondLatestPattern,
}: EntryGateProps) => {
    return (
        <div className="relative flex h-full flex-col items-center justify-center gap-8 px-8 py-10">
            {/* Back link */}
            <Link
                href="/home"
                className="absolute left-8 top-10 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                Back
            </Link>

            {/* Hero */}
            <div className="text-center">
                <h1 className="font-serif text-4xl italic leading-tight text-neutral-500">
                    Your journal is waiting for you.
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                    You've built a real habit and a lot left to uncover. Pick up
                    right where you left off.
                </p>
            </div>

            {/* Stats */}
            <div className="flex w-full max-w-xl divide-x divide-border rounded-xl border border-border bg-card">
                <StatCell label="Entries written" value={totalEntries} />
                <StatCell label="Patterns found" value={patternsCount} />
                <StatCell label="Insights given" value={insightsCount} />
            </div>

            {/* Locked feature previews */}
            <div className="grid w-full max-w-xl grid-cols-2 gap-4">
                <LockedPreviewCard
                    icon={Activity01Icon}
                    title="Progress"
                    subtitle={
                        <>
                            Watch yourself change.
                            <br />
                            Entry by entry, week by week.
                        </>
                    }
                    extra={
                        <div className="flex flex-col gap-1.5">
                            <div className="relative h-1.5 rounded-full bg-neutral-300 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-slate-400 overflow-hidden"
                                    style={{ width: `${GATE_BAR_FILL_PCT}%` }}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(251,146,60,0.75)_5%,rgba(255,115,1,0.45)_20%,transparent_55%)]" />
                                </div>
                            </div>
                            {/* TODO: understand if with/out this text cuz affects the current design */}
                            <p className="text-xs text-neutral-400">
                                Keep writing to unlock your next reflection
                            </p>
                        </div>
                    }
                >
                    {latestProgressInsight ? (
                        <div className="ml-10 origin-top-left scale-[0.50] w-[200%]">
                            <ProgressCard
                                insight={latestProgressInsight}
                                isPreview
                            />
                        </div>
                    ) : (
                        <Skeleton className="h-full w-full rounded-lg" />
                    )}
                </LockedPreviewCard>

                <LockedPreviewCard
                    icon={DashboardSquare01Icon}
                    title="Patterns"
                    subtitle={
                        <>
                            The themes running your life,
                            <br />
                            finally named.
                        </>
                    }
                >
                    {latestPattern ? (
                        <div className="ml-10 origin-top-left scale-[0.45] w-[200%] flex gap-4 flex-col">
                            <PatternCard
                                pattern={latestPattern}
                                from="/patterns"
                                isPreview
                            />
                            <PatternCard
                                pattern={secondLatestPattern ?? latestPattern}
                                from="/patterns"
                                isPreview
                            />
                        </div>
                    ) : (
                        <Skeleton className="h-full w-full rounded-lg" />
                    )}
                </LockedPreviewCard>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3">
                <Button asChild variant="sunrise">
                    <Link href={CHECKOUT_URL}>Continue with Pro</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                    Cancel anytime.{" "}
                    <Link
                        href="/upgrade"
                        className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                    >
                        See everything that's included →
                    </Link>
                </p>
            </div>
        </div>
    );
};

export { EntryGate };
