"use client";

import { ArrowDown01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { deleteEntryAction } from "@/app/actions/entries";
import { DeleteConfirmPopover } from "@/components/shared/delete-confirm-popover";
import { Separator } from "@/components/ui/separator";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { cn, formatEntryDate } from "@/lib/utils";
import type { EntryWithInsight } from "@/types";
import { EntryTag } from "./entry-tag";

interface EntryCardProps {
    entry: EntryWithInsight;
    entryNumber: number;
    onEntryDeleted?: (entryId: string) => void;
    isPreview?: boolean;
}

const EntryCard = ({
    entry,
    entryNumber,
    onEntryDeleted,
    isPreview = false,
}: EntryCardProps) => {
    const [isInsightExpanded, setIsInsightExpanded] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const hasInsight = !!entry.entryInsight;
    const tags = (entry.entryInsight?.tags ?? []) as InsightTagType[];

    const handleDelete = async () => {
        if (!onEntryDeleted) return;
        setIsDeleting(true);
        await deleteEntryAction(entry.id);
        onEntryDeleted(entry.id);
    };

    const headerContent = (
        <>
            {/* Header: date + insights toggle */}
            <div className="relative z-10 flex items-start justify-between px-6 pt-4">
                <h3
                    className={cn(
                        "font-serif italic text-zinc-600",
                        isPreview ? "text-2xl" : "text-xl",
                    )}
                >
                    {formatEntryDate(entry.createdAt)}
                </h3>
                {hasInsight && (
                    <button
                        type="button"
                        onClick={
                            isPreview
                                ? undefined
                                : (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsInsightExpanded((prev) => !prev);
                                  }
                        }
                        className={cn(
                            "inline-flex h-6 cursor-pointer items-center gap-1 rounded-full border bg-background px-2.5 font-medium text-zinc-600 transition-colors hover:text-foreground",
                            isPreview ? "text-lg h-8" : "text-[12px]",
                        )}
                    >
                        Insights
                        <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={`size-2.5 transition-transform duration-300 ${isInsightExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                )}
            </div>

            {/* Entry content with bottom fade */}
            <div className="relative overflow-hidden px-6 pt-3 pb-1">
                <p
                    className={cn(
                        "h-26 leading-relaxed text-muted-foreground",
                        isPreview ? "text-2xl" : undefined,
                    )}
                >
                    {entry.content}
                </p>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent" />
            </div>
        </>
    );

    return (
        <div
            className={cn(
                "relative shadow-xs flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-500",
                isInsightExpanded
                    ? "border border-transparent [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(to_right,rgb(148,163,184),rgba(148,163,184,0.9),rgba(251,146,60,0.6))_border-box]"
                    : "border border-border",
            )}
        >
            {/* Clickable area: date + content → navigates to entry */}
            {isPreview ? (
                <div className="flex flex-col">{headerContent}</div>
            ) : (
                <Link href={`/entries/${entry.id}`} className="flex flex-col">
                    {headerContent}
                </Link>
            )}

            <Separator className="mt-3" />

            {/* Footer: entry number + tags + delete */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "inline-flex h-7 items-center rounded-md border border-zinc-400 bg-zinc-100 px-2 font-medium text-zinc-500",
                            isPreview ? "text-sm" : "text-xs",
                        )}
                    >
                        #{entryNumber}
                    </span>
                    {tags.map((tag) => (
                        <EntryTag
                            key={tag}
                            name={tag}
                            className={isPreview ? "text-lg" : undefined}
                        />
                    ))}
                </div>

                {!isPreview && (
                    <DeleteConfirmPopover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                        onConfirm={handleDelete}
                        isDeleting={isDeleting}
                        title="Permanently delete this entry?"
                        description="This will remove it from your records. Are you sure?"
                    >
                        <button
                            type="button"
                            className="text-neutral-400 transition-colors hover:text-red-500"
                        >
                            <HugeiconsIcon
                                icon={Delete01Icon}
                                className="size-4"
                                strokeWidth={2}
                            />
                        </button>
                    </DeleteConfirmPopover>
                )}
            </div>

            {/* Insight overlay — slides up from bottom, fully clickable */}
            {hasInsight && !isPreview && (
                <Link
                    href={`/entries/${entry.id}`}
                    className={`absolute inset-x-0 bottom-0 z-20 rounded-t-xl border-t bg-neutral-100 transition-transform duration-500 ease-in-out ${isInsightExpanded ? "translate-y-0" : "translate-y-full"}`}
                >
                    <div className="relative overflow-hidden px-6 pt-4 pb-6">
                        <p className="h-26 leading-relaxed text-muted-foreground italic">
                            {entry.entryInsight?.content}
                        </p>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-neutral-100 to-transparent" />
                    </div>
                </Link>
            )}
        </div>
    );
};

export { EntryCard, type EntryCardProps };
