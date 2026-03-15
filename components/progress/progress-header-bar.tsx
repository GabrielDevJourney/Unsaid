import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";

interface ProgressHeaderBarProps {
    totalEntries: number;
    totalInsights: number;
    entryCountAtLastProgress: number;
}

const ProgressHeaderBar = ({
    totalEntries,
    totalInsights,
    entryCountAtLastProgress,
}: ProgressHeaderBarProps) => {
    const entriesInCycle = Math.max(0, totalEntries - entryCountAtLastProgress);
    const fillPct = (entriesInCycle / PROGRESS_TRIGGER_INTERVAL) * 100;
    const nextIn =
        entriesInCycle === 0
            ? PROGRESS_TRIGGER_INTERVAL
            : PROGRESS_TRIGGER_INTERVAL - entriesInCycle;
    const depth = Math.floor(totalEntries / PROGRESS_TRIGGER_INTERVAL);
    const depthLabel = `Depth ${String(depth).padStart(2, "0")}`;

    return (
        <div className="flex items-center justify-start gap-6 px-10 border-b">
            {/* Progress bar */}
            <div className="flex flex-1 flex-col gap-2 py-10 px-6">
                <div className="relative h-2 rounded-full bg-neutral-300 overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-slate-400 overflow-hidden "
                        style={{ width: `${fillPct}%` }}
                    >
                        {/* Sunrise gradient overlay — same as button sunrise variant */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(251,146,60,0.75)_5%,rgba(255,115,1,0.45)_20%,transparent_55%)]" />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Next synthesis in{" "}
                    <span className="font-medium text-neutral-600">
                        {nextIn} {nextIn === 1 ? "entry" : "entries"}
                    </span>
                </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2 items-start justify-center border-x px-8 h-full">
                <span className="text-4xl text-muted-foreground font-serif italic tabular-nums">
                    {String(totalInsights).padStart(2, "0")}
                </span>
                <span className="text-sm text-muted-foreground">
                    Reflections
                </span>
            </div>
            <div className="flex-2 flex flex-col gap-2 items-start justify-center h-full">
                <span className="text-4xl text-muted-foreground font-serif italic">
                    {depthLabel}
                </span>
                <span className="text-sm text-muted-foreground">
                    Expansion level
                </span>
            </div>
        </div>
    );
};

export { ProgressHeaderBar };
