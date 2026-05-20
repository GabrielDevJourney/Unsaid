"use client";

import Link from "next/link";
import { markPatternAsViewedAction } from "@/app/actions/weekly-insights";
import { ReferenceTimeline } from "@/components/shared/reference-timeline";
import {
    PATTERN_TYPE_BADGE_STYLES,
    PATTERN_TYPES,
} from "@/lib/constants/pattern-types";
import type { WeeklyInsightPattern } from "@/types";

interface PatternCardProps {
    pattern: WeeklyInsightPattern;
    from?: string;
    onViewed?: (id: string) => void;
    isPreview?: boolean;
}

const PatternCard = ({
    pattern,
    from = "/patterns",
    onViewed,
    isPreview = false,
}: PatternCardProps) => {
    const badgeStyle =
        PATTERN_TYPE_BADGE_STYLES[pattern.patternType] ??
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
        <div
            className={`flex ${isPreview ? "h-52 md:h-50" : "h-52 md:h-56"} rounded-xl border border-border bg-card shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden`}
        >
            {/* Left: each pill is its own Link to the referenced entry */}
            <div className="border-r border-border">
                <ReferenceTimeline
                    items={pattern.evidence.map((e) => ({
                        id: e.entryId,
                        label: e.label,
                    }))}
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
                <div className="flex items-center gap-2 flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden md:flex-wrap">
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
                <h3 className="font-serif text-xl md:text-2xl italic text-muted-foreground leading-snug line-clamp-2">
                    {pattern.title}
                </h3>
                <p
                    className={`text-sm text-muted-foreground leading-relaxed ${isPreview ? "line-clamp-2" : "line-clamp-2 md:line-clamp-4"}`}
                >
                    {pattern.description}
                </p>
            </Link>
        </div>
    );
};

export { PatternCard, type PatternCardProps };
