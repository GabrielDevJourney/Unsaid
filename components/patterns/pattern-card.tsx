"use client";

import Link from "next/link";
import { markPatternAsViewedAction } from "@/app/actions/weekly-insights";
import { PATTERN_TYPES } from "@/lib/constants/pattern-types";
import type { WeeklyInsightPattern } from "@/types";
import { TYPE_BADGE_STYLES } from "./pattern-badge-styles";
import { ReferenceTimeline } from "./reference-timeline";

interface PatternCardProps {
    pattern: WeeklyInsightPattern;
    from?: string;
    onViewed?: (id: string) => void;
}

const PatternCard = ({
    pattern,
    from = "/patterns",
    onViewed,
}: PatternCardProps) => {
    const badgeStyle =
        TYPE_BADGE_STYLES[pattern.patternType] ??
        "border-zinc-300 bg-zinc-100 text-zinc-600";
    const typeLabel =
        PATTERN_TYPES[pattern.patternType]?.label ?? pattern.patternType;

    const handleView = async () => {
        if (!pattern.isViewed) {
            onViewed?.(pattern.id);
            await markPatternAsViewedAction(pattern.id);
        }
    };

    return (
        // Outer div — not a Link, so pills inside can be valid <a> siblings
        <div className="flex h-56 rounded-xl border border-border bg-card shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden">
            {/* Left: each pill is its own Link to the referenced entry */}
            <div className="border-r border-border">
                <ReferenceTimeline
                    items={pattern.evidence}
                    from={from}
                    className="h-full"
                />
            </div>

            {/* Right: entire content area is a Link to the pattern detail page */}
            <Link
                href={`/patterns/${pattern.id}`}
                onClick={handleView}
                className="flex flex-col gap-2 p-5 flex-1 min-w-0"
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`inline-flex h-7 items-center rounded-sm border px-2 text-xs font-medium ${badgeStyle}`}
                    >
                        {typeLabel}
                    </span>
                    {!pattern.isViewed && (
                        <span className="inline-flex h-7 items-center rounded-sm bg-neutral-500 px-2 text-xs font-medium text-white">
                            New
                        </span>
                    )}
                </div>
                <h3 className="font-serif text-2xl italic text-muted-foreground leading-snug line-clamp-2">
                    {pattern.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {pattern.description}
                </p>
            </Link>
        </div>
    );
};

export { PatternCard, type PatternCardProps };
