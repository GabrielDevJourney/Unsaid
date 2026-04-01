"use client";

import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toggleUpvoteAction } from "@/app/actions/feedback";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
    feedbackId: string;
    upvoteCount: number;
    hasVoted: boolean;
    onToggle: (newState: { hasVoted: boolean }) => void;
}

const UpvoteButton = ({
    feedbackId,
    upvoteCount,
    hasVoted,
    onToggle,
}: UpvoteButtonProps) => {
    const [isPending, setIsPending] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPending) return;

        const optimisticState = { hasVoted: !hasVoted };
        onToggle(optimisticState);
        setIsPending(true);

        try {
            const result = await toggleUpvoteAction(feedbackId);
            if (result.error) {
                onToggle({ hasVoted });
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                "flex w-10 min-h-14 shrink-0 justify-center flex-col items-center gap-1 rounded-xl border transition-colors bg-accent text-neutral-600 cursor-pointer",
                hasVoted
                    ? "border-transparent text-zinc-600 [background:linear-gradient(var(--accent),var(--accent))_padding-box,linear-gradient(to_right,rgb(148,163,184),rgba(148,163,184,0.9),rgba(251,146,60,0.6))_border-box]"
                    : "border-border text-zinc-400 hover:text-zinc-600",
            )}
        >
            <HugeiconsIcon
                icon={ArrowUp01Icon}
                className={cn("size-4 transition-transform text-foreground")}
            />
            <span
                className={cn(
                    "text-sm font-medium tabular-nums",
                    hasVoted ? "text-zinc-600" : "text-zinc-500",
                )}
            >
                {upvoteCount}
            </span>
        </button>
    );
};

export { UpvoteButton };
