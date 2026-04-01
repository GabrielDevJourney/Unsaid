"use client";

import { Button } from "@/components/ui/button";

interface FeedbackEmptyStateProps {
    onSubmitClick: () => void;
}

const GhostFeedbackCard = () => (
    <div className="relative h-52 w-[480px]">
        {/* Back card — dashed, rotated left */}
        <div className="absolute bottom-2 left-4 h-28 w-[440px] rounded-xl border-2 border-dashed border-zinc-300/60 bg-zinc-100/40 -rotate-1" />

        {/* Front card — skeleton, rotated right */}
        <div className="absolute bottom-8 left-8 flex w-[440px] rotate-2 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
            {/* Upvote panel */}
            <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-2 border-r border-zinc-200/60 bg-zinc-50/80 px-2 py-5">
                <div className="h-5 w-5 rounded bg-zinc-200/70" />
                <div className="h-3 w-6 rounded-full bg-zinc-200/50" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                <div className="h-4 w-3/4 rounded-full bg-zinc-200/70" />
                <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-zinc-200/50" />
                    <div className="h-2.5 w-5/6 rounded-full bg-zinc-200/40" />
                </div>
                <div className="h-2.5 w-1/4 rounded-full bg-zinc-200/30" />
            </div>
        </div>
    </div>
);

const FeedbackEmptyState = ({ onSubmitClick }: FeedbackEmptyStateProps) => (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-10 py-20">
        <div className="flex flex-col gap-4">
            <p className="font-serif text-5xl italic text-muted-foreground">
                No feedback posts yet
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
                No posts yet. Be the first to tell us what&apos;s working,
                what&apos;s not, or what you wish existed.
            </p>
            <div>
                <Button variant="sunrise" size="sm" onClick={onSubmitClick}>
                    + Submit feedback
                </Button>
            </div>
        </div>

        <div className="select-none pointer-events-none mask-b-from-40% mask-b-to-100%">
            <GhostFeedbackCard />
        </div>
    </div>
);

export { FeedbackEmptyState };
