"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import type { InsightTagType } from "@/lib/constants/insight-tag-types";
import { cn, formatEntryDate } from "@/lib/utils";
import type { EntryWithInsight } from "@/types";
import { EntryTag } from "./entry-tag";

interface EntryCardProps {
    entry: EntryWithInsight;
    entryNumber: number;
}

const EntryCard = ({ entry, entryNumber }: EntryCardProps) => {
    const [isInsightExpanded, setIsInsightExpanded] = useState(false);
    const hasInsight = !!entry.entryInsight;
    const tags = (entry.entryInsight?.tags ?? []) as InsightTagType[];

    return (
        <Link
            href={`/entries/${entry.id}`}
            className={cn(
                "relative shadow-xs flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-500",
                isInsightExpanded
                    ? "border border-transparent [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(to_right,rgb(148,163,184),rgba(148,163,184,0.9),rgba(251,146,60,0.6))_border-box]"
                    : "border border-border",
            )}
        >
            {/* Header: date + insights toggle */}
            <div className="relative z-10 flex items-start justify-between px-5 pt-5">
                <h3 className="font-serif text-xl italic text-zinc-600">
                    {formatEntryDate(entry.createdAt)}
                </h3>
                {hasInsight && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsInsightExpanded((prev) => !prev);
                        }}
                        className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-full border bg-background px-2.5 text-[11px] text-zinc-600 font-medium transition-colors hover:text-foreground"
                    >
                        Insights
                        <ChevronDown
                            className={`size-2.5 transition-transform duration-300 ${isInsightExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                )}
            </div>

            {/* Entry content with bottom fade */}
            <div className="relative overflow-hidden px-5 pt-3 pb-1">
                <p className="h-26 leading-relaxed text-muted-foreground">
                    {entry.content}
                </p>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent" />
            </div>

            <Separator className="mt-3" />

            {/* Footer: entry number + tags */}
            <div className="flex items-center gap-2 px-5 py-3">
                <span className="inline-flex h-7 items-center rounded-md border border-zinc-400 bg-zinc-100 px-2 text-xs font-medium text-zinc-500">
                    #{entryNumber}
                </span>
                {tags.map((tag) => (
                    <EntryTag key={tag} name={tag} />
                ))}
            </div>

            {/* Insight overlay -- slides up from bottom */}
            {hasInsight && (
                <div
                    className={`absolute inset-x-0 bottom-0 z-20 rounded-t-xl border-t bg-neutral-100 transition-transform duration-500 ease-in-out ${isInsightExpanded ? "translate-y-0" : "translate-y-full"}`}
                >
                    {/* Insight content with fade */}
                    <div className="relative overflow-hidden px-5 pt-4 pb-2">
                        <p className="h-26 leading-relaxed text-muted-foreground italic">
                            {entry.entryInsight?.content}
                        </p>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-neutral-100 to-transparent" />
                    </div>

                    {/* Read more label */}
                    <div className="flex justify-end px-5 pb-4">
                        <span className="inline-flex h-8 items-center rounded-full border-2 bg-card px-4 text-xs font-medium text-muted-foreground">
                            Read more
                        </span>
                    </div>
                </div>
            )}
        </Link>
    );
};

export { EntryCard, type EntryCardProps };
