const SkeletonCard = () => (
    <div className="h-52 w-72 rounded-xl border border-zinc-200/80 bg-white shadow-sm">
        {/* Header: pill badge */}
        <div className="flex justify-between px-5 pt-5">
            <div className="h-3 w-24 rounded-full bg-zinc-200/80" />
            <div className="h-6 w-24 rounded-full border border-zinc-200/60 bg-zinc-100/80" />
        </div>

        {/* Skeleton text lines */}
        <div className="space-y-2.5 px-5 pt-4">
            <div className="h-2.5 w-full rounded-full bg-zinc-200/70" />
            <div className="h-2.5 w-5/6 rounded-full bg-zinc-200/50" />
            <div className="h-2.5 w-2/3 rounded-full bg-zinc-200/40" />
        </div>

        {/* Separator */}
        <div className="mx-5 mt-5 border-t border-zinc-200/60" />

        {/* Footer: tag skeletons */}
        <div className="flex gap-2 px-5 pt-3">
            <div className="h-6 w-10 rounded-md bg-zinc-200/60" />
            <div className="h-6 w-16 rounded-sm bg-zinc-100 border border-zinc-200/50" />
            <div className="h-6 w-14 rounded-sm bg-zinc-100 border border-zinc-200/50" />
        </div>
    </div>
);

const DashedCard = () => (
    <div className="h-52 w-72 rounded-xl border-2 border-dashed border-zinc-300/60 bg-zinc-100/40" />
);

const HomeEmptyState = () => {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="relative h-56 w-80">
                {/* Back card — dashed, rotated left */}
                <DashedCard />

                {/* Front card — skeleton, rotated right */}
                <div className="absolute bottom-15 left-10 rotate-4">
                    <SkeletonCard />
                </div>
            </div>
        </div>
    );
};

export { HomeEmptyState };
