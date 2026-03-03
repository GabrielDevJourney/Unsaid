import { JournalDot } from "@/components/ui/journal-dot";

const GhostReferenceItem = () => (
    <div className="relative flex items-center gap-2 rounded-full border-2 border-zinc-300 bg-white px-3 py-1.5">
        <JournalDot />
        <div className="h-3 flex-1 rounded-full bg-zinc-200" />
    </div>
);

const GhostPatternCard = () => (
    <div className="relative h-80 w-200">
        {/* Back card */}
        <div className="absolute bottom-8 left-6 h-46 w-165 rounded-2xl bg-zinc-200" />

        {/* Front card — full ghost pattern card, clockwise tilt, shadow for elevation */}
        <div className="absolute bottom-16 left-16 h-50 w-165 -rotate-4 flex overflow-hidden rounded-2xl border border-dashed border-muted-foreground shadow-2xl shadow-zinc-400/25">
            {/* Left: reference timeline panel */}
            <div className="w-44 shrink-0 border-r border-dashed border-zinc-400 bg-neutral-100 px-5 py-5 bg-[radial-gradient(circle,#dddcdc_1px,transparent_1px)] bg-size-[10px_10px]">
                <p className="mb-3 text-[11px] font-medium text-zinc-500">
                    Reference points
                </p>
                <div className="relative flex flex-col gap-3">
                    <div className="absolute bottom-4 left-6 top-4 z-20 w-px bg-zinc-400" />
                    <GhostReferenceItem />
                    <GhostReferenceItem />
                    <GhostReferenceItem />
                </div>
            </div>

            {/* Right: pattern content */}
            <div className="flex flex-1 flex-col gap-3 bg-white px-5 py-5">
                <div className="h-7 w-28 rounded-lg border border-border bg-zinc-100" />
                <div className="mt-0.5 flex flex-col gap-2">
                    <div className="h-3 w-4/5 rounded-full bg-zinc-200/70" />
                    <div className="h-2.5 w-3/4 rounded-full bg-zinc-200/50" />
                    <div className="h-2.5 w-1/2 rounded-full bg-zinc-200/30" />
                </div>
            </div>
        </div>
    </div>
);

const PatternsEmptyState = () => (
    <div className="flex h-full flex-col items-center justify-center gap-10 px-10 py-20">
        <div className="flex flex-col gap-4 max-w-2xl">
            <p className="font-serif text-5xl italic text-muted-foreground">
                No patterns yet
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
                As you journal, Unsaid identifies recurring themes, emotional
                triggers, and thought patterns unique to you. These insights
                help you understand yourself better over time. Start with your
                first entry to begin uncovering your patterns.
            </p>
        </div>

        {/* Illustration — mask fades both cards at the bottom */}
        <div className="select-none pointer-events-none mask-b-from-40% mask-b-to-100%">
            <GhostPatternCard />
        </div>
    </div>
);

export { PatternsEmptyState };
