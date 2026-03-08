"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { PageHeader } from "@/components/layout/page-header";
import { Toolbar } from "@/components/shared/toolbar";
import { PATTERN_TYPES } from "@/lib/constants/pattern-types";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type {
    WeeklyInsightPatternWithSimilarity,
    WeeklyInsightWithPatterns,
} from "@/types";
import { PatternsEmptyState } from "./patterns-empty-state";
import { WeeklySection } from "./weekly-section";

const PATTERN_TYPE_OPTIONS = Object.values(PATTERN_TYPES).map((type) => ({
    value: type.code,
    label: type.label,
    color: type.color,
}));

interface PatternsViewProps {
    insights: WeeklyInsightWithPatterns[];
}

const isWeekInRange = (weekStart: string, range: DateRange): boolean => {
    if (!range.from) return false;
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const to = range.to ?? range.from;
    return start <= to && end >= range.from;
};

const groupSearchResultsByWeek = (
    patterns: WeeklyInsightPatternWithSimilarity[],
): WeeklyInsightWithPatterns[] => {
    const grouped = new Map<string, WeeklyInsightPatternWithSimilarity[]>();
    for (const pattern of patterns) {
        const key = pattern.weeklyInsightId;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)?.push(pattern);
    }

    return Array.from(grouped.entries()).map(([weeklyInsightId, group]) => ({
        id: weeklyInsightId,
        userId: "",
        weekStart: group[0].weekStart,
        entryIds: [],
        createdAt: "",
        updatedAt: "",
        patterns: group,
    }));
};

const PatternsView = ({ insights }: PatternsViewProps) => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<
        WeeklyInsightPatternWithSimilarity[] | null
    >(null);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setSearchResults(null);
            return;
        }

        const controller = new AbortController();

        const fetchResults = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `/api/weekly-insights/search?q=${encodeURIComponent(debouncedQuery)}&threshold=0.4`,
                    { signal: controller.signal },
                );
                if (!res.ok) return;

                const json = (await res.json()) as {
                    data?: { patterns: WeeklyInsightPatternWithSimilarity[] };
                };
                if (json.data) setSearchResults(json.data.patterns);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError")
                    return;
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        };

        fetchResults();
        return () => controller.abort();
    }, [debouncedQuery]);

    const handlePatternViewed = (id: string) => {
        setViewedIds((prev) => new Set([...prev, id]));
    };

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 0);
    }, []);

    const toggleType = (type: string) => {
        setSelectedTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

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

    const filtered = useMemo(
        () =>
            insightsWithPatterns
                .map((insight) => ({
                    ...insight,
                    patterns: insight.patterns.filter(
                        (p) =>
                            selectedTypes.size === 0 ||
                            selectedTypes.has(p.patternType),
                    ),
                }))
                .filter(
                    (insight) =>
                        insight.patterns.length > 0 &&
                        (!dateRange?.from ||
                            isWeekInRange(insight.weekStart, dateRange)),
                ),
        [insightsWithPatterns, selectedTypes, dateRange],
    );

    const searchGrouped = useMemo(
        () => (searchResults ? groupSearchResultsByWeek(searchResults) : null),
        [searchResults],
    );

    const liveNewCount = useMemo(
        () =>
            insightsWithPatterns
                .flatMap((i) => i.patterns)
                .filter((p) => !p.isViewed).length,
        [insightsWithPatterns],
    );

    const displayInsights = searchGrouped ?? filtered;

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

            <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
                {insightsWithPatterns.length === 0 ? (
                    <PatternsEmptyState />
                ) : (
                    <div className="flex flex-col gap-6 px-10 py-8">
                        <Toolbar
                            isScrolled={isScrolled}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            searchPlaceholder="Search patterns..."
                            filterOptions={PATTERN_TYPE_OPTIONS}
                            selectedFilters={selectedTypes}
                            onToggleFilter={toggleType}
                            onClearFilters={() => setSelectedTypes(new Set())}
                            filterLabel="type"
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />

                        {isSearching ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                            </div>
                        ) : displayInsights.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <p>No patterns match your filters.</p>
                            </div>
                        ) : (
                            displayInsights.map((insight, index) => (
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
