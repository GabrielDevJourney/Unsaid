"use client";

import Image from "next/image";
import { FEEDBACK_STATUS_CONFIG } from "@/lib/constants/feedback-status-types";
import { cn } from "@/lib/utils";
import type { FeedbackItemWithVote } from "@/types";
import { UpvoteButton } from "./upvote-button";

interface FeedbackCardProps {
    item: FeedbackItemWithVote;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUpvoteToggle: (
        feedbackId: string,
        newState: { hasVoted: boolean },
    ) => void;
}

const formatTimeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return mins <= 1 ? "just now" : `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
};

const FeedbackCard = ({
    item,
    isExpanded,
    onToggleExpand,
    onUpvoteToggle,
}: FeedbackCardProps) => {
    const badge =
        item.status !== "open" ? FEEDBACK_STATUS_CONFIG[item.status] : null;

    return (
        <div className="flex items-start rounded-xl border border-border bg-card min-h-36 p-4 gap-2">
            {/* Upvote panel */}
            <UpvoteButton
                feedbackId={item.id}
                upvoteCount={item.upvote_count}
                hasVoted={item.hasVoted}
                onToggle={(newState) => onUpvoteToggle(item.id, newState)}
            />

            {/* Content */}
            <button
                type="button"
                onClick={onToggleExpand}
                className="flex-1 cursor-pointer p-2 text-left"
            >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-2xl italic leading-snug text-neutral-600">
                        {item.title}
                    </h3>
                    {badge && (
                        <span
                            className={cn(
                                "shrink-0 rounded-sm border px-2 py-1 text-xs font-medium",
                                badge.color,
                            )}
                        >
                            {badge.label}
                        </span>
                    )}
                </div>

                {/* Description */}
                <p
                    className={cn(
                        "mt-1.5 text-sm text-neutral-400 leading-relaxed",
                        !isExpanded && "line-clamp-2",
                    )}
                >
                    {item.description}
                </p>

                {/* Footer — stable position, always above expandable content */}
                <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
                    {!item.is_anonymous && item.author_name && (
                        <p>{item.author_name}.</p>
                    )}
                    <p>{formatTimeAgo(item.created_at)}</p>
                </div>

                {/* Expandable section — smooth slide via grid-rows */}
                <div
                    className={cn(
                        "grid transition-[grid-template-rows] duration-500 ease-in-out",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                >
                    <div className="overflow-hidden">
                        {item.image_url && (
                            <div className="relative mt-4 h-60 w-full overflow-hidden rounded-lg bg-zinc-100">
                                <Image
                                    src={item.image_url}
                                    alt="Attached screenshot"
                                    fill
                                    unoptimized
                                    className="object-contain"
                                />
                            </div>
                        )}

                        {item.admin_reply && (
                            <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-zinc-700">
                                        The Unsaid Team
                                    </span>
                                    {item.admin_reply_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatTimeAgo(item.admin_reply_at)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    {item.admin_reply}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </button>
        </div>
    );
};

export { FeedbackCard };
