"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { PageHeader } from "@/components/layout/page-header";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { WeeklyInsightWithPatterns } from "@/types";
import { PatternsEmptyState } from "./patterns-empty-state";
import { WeeklySection } from "./weekly-section";

interface PatternsViewProps {
    insights: WeeklyInsightWithPatterns[];
}

const isWeekInRange = (weekStart: string, range: DateRange): boolean => {
    if (!range.from) return false;
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const from = range.from;
    const to = range.to ?? from;
    return start <= to && end >= from;
};

const PatternsView = ({ insights }: PatternsViewProps) => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

    const handlePatternViewed = (id: string) => {
        setViewedIds((prev) => new Set([...prev, id]));
    };

    // Merge optimistic viewed state so card and count update immediately
    const enrichedInsights = useMemo(
        () =>
            insights.map((insight) => ({
                ...insight,
                patterns: insight.patterns.map((p) => ({
                    ...p,
                    isViewed: p.isViewed || viewedIds.has(p.id),
                })),
            })),
        [insights, viewedIds],
    );

    const insightsWithPatterns = enrichedInsights.filter(
        (i) => i.patterns.length > 0,
    );

    const filtered = dateRange?.from
        ? insightsWithPatterns.filter((i) =>
              isWeekInRange(i.weekStart, dateRange),
          )
        : insightsWithPatterns;

    const liveNewCount = useMemo(
        () =>
            insightsWithPatterns
                .flatMap((i) => i.patterns)
                .filter((p) => !p.isViewed).length,
        [insightsWithPatterns],
    );

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref="/home">
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="font-serif text-4xl italic text-zinc-600">
                            Patterns
                        </h1>
                        {liveNewCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-neutral-500 px-3 py-1 text-xs font-medium text-white">
                                {liveNewCount} new{" "}
                                {liveNewCount === 1 ? "insight" : "insights"}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Discover patterns from your journal entries, updated{" "}
                        <strong className="font-medium text-zinc-600">
                            weekly
                        </strong>
                        .
                    </p>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto">
                {insightsWithPatterns.length === 0 ? (
                    <PatternsEmptyState />
                ) : (
                    <div className="flex flex-col gap-6 px-10 py-8">
                        {/* Calendar filter — lives here, always visible so the
                            user can always clear even when results are empty */}
                        <div className="flex items-center justify-end">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs shadow-xs hover:text-zinc-700 transition-colors",
                                            dateRange?.from
                                                ? "font-medium text-zinc-800"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        <HugeiconsIcon
                                            icon={Calendar03Icon}
                                            className="size-3.5"
                                            strokeWidth={1.5}
                                        />
                                        Calendar
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    className="w-auto p-0 rounded-xl shadow-lg"
                                >
                                    <div className="flex items-center justify-between px-4 pt-3">
                                        {dateRange?.from && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDateRange(undefined)
                                                }
                                                className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <p>No patterns match your filters.</p>
                            </div>
                        ) : (
                            filtered.map((insight, index) => (
                                <WeeklySection
                                    key={insight.id}
                                    insight={insight}
                                    defaultOpen={index < 2}
                                    onPatternViewed={handlePatternViewed}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export { PatternsView };
