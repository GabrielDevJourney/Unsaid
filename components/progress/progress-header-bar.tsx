import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";
import { computeProgressCycle } from "@/lib/progress-insights/utils";

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
    const { fillPct, nextIn } = computeProgressCycle({
        totalEntries,
        entryCountAtLastProgress,
    });
    const depth = Math.floor(totalEntries / PROGRESS_TRIGGER_INTERVAL);
    const depthLabel = `Depth ${String(depth).padStart(2, "0")}`;

    return (
        <div className="flex flex-col px-6 md:flex-row md:items-center md:justify-start md:gap-6 md:px-10 border-b">
            {/* Depth — top on mobile, last (order-3) on desktop */}
            <div className="flex flex-col items-start gap-0.5 pt-5 pb-3 md:py-0 md:flex-2 md:gap-2 md:justify-center md:h-full md:order-3">
                <span className="text-4xl text-muted-foreground font-serif italic">
                    {depthLabel}
                </span>
                <span className="text-sm text-muted-foreground">
                    Expansion level
                </span>
            </div>

            {/* Reflections + Bar: side-by-side row on mobile (bar only visible), unwrapped on desktop via md:contents */}
            <div className="flex flex-row items-center gap-4 pb-6 md:contents">
                {/* Reflections — hidden on mobile, middle (order-2) on desktop */}
                <div className="hidden md:flex flex-col items-start gap-2 md:py-0 md:justify-center md:border-x md:px-8 md:h-full md:order-2">
                    <span className="text-4xl text-muted-foreground font-serif italic tabular-nums">
                        {String(totalInsights).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        Reflections
                    </span>
                </div>

                {/* Bar — full width on mobile, first (order-1) on desktop */}
                <div className="flex flex-col gap-1 flex-1 md:py-10 md:px-6 md:flex-1 md:order-1">
                    <div className="relative h-2 rounded-full bg-neutral-300 overflow-hidden w-[75%] md:w-full">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full bg-slate-400 overflow-hidden"
                            style={{ width: `${fillPct}%` }}
                        >
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
            </div>
        </div>
    );
};

export { ProgressHeaderBar };
