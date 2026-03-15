const GhostProgressCard = () => (
    <div className="relative h-64 w-96">
        {/* Back card */}
        <div className="absolute bottom-6 left-4 h-36 w-84 rounded-2xl bg-zinc-200" />

        {/* Front card — dotted background + white inner */}
        <div className="absolute bottom-12 left-10 h-44 w-84 -rotate-2 overflow-hidden rounded-2xl border border-dashed border-muted-foreground shadow-2xl shadow-zinc-400/25 bg-neutral-100 bg-[radial-gradient(circle,#dddcdc_1px,transparent_1px)] bg-size-[10px_10px]">
            <div className="m-3 rounded-xl bg-white px-4 py-4 flex flex-col gap-3">
                <div className="h-3 w-3/4 rounded-full bg-zinc-200/70" />
                <div className="h-2.5 w-full rounded-full bg-zinc-200/50" />
                <div className="h-2.5 w-5/6 rounded-full bg-zinc-200/40" />
                <div className="h-2.5 w-2/3 rounded-full bg-zinc-200/30" />
            </div>
        </div>
    </div>
);

const ProgressEmptyState = () => (
    <div className="flex h-full flex-col items-center justify-center gap-10 px-10 py-20">
        <div className="flex flex-col gap-4 max-w-2xl">
            <p className="font-serif text-5xl italic text-muted-foreground">
                No reflections yet
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
                Every 15 journal entries, Unsaid synthesizes your growth into a
                deep reflection — a mirror for your evolving mind. Keep
                journaling to unlock your first one.
            </p>
        </div>

        <div className="select-none pointer-events-none mask-b-from-40% mask-b-to-100%">
            <GhostProgressCard />
        </div>
    </div>
);

export { ProgressEmptyState };
