"use client";

import { useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DateFilter } from "@/components/home/date-filter";
import { PageHeader } from "@/components/layout/page-header";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { useSidebarBadgeStore } from "@/lib/stores/sidebar-badge-store";
import type { ProgressInsight } from "@/types";
import { ProgressCard } from "./progress-card";
import { ProgressEmptyState } from "./progress-empty-state";
import { ProgressHeaderBar } from "./progress-header-bar";

const PAGE_SIZE = 20;
interface ProgressViewProps {
    insights: ProgressInsight[];
    totalInsights: number;
    totalEntries: number;
    entryCountAtLastProgress: number;
    initialHasMore: boolean;
}

const isInsightInRange = (createdAt: string, range: DateRange): boolean => {
    if (!range.from) return false;
    const date = new Date(createdAt);
    const to = range.to ? new Date(range.to) : new Date(range.from);
    to.setHours(23, 59, 59, 999);
    return date >= range.from && date <= to;
};

const ProgressView = ({
    insights: initialInsights,
    initialHasMore,
    totalInsights,
    totalEntries,
    entryCountAtLastProgress,
}: ProgressViewProps) => {
    const [insights, setInsights] =
        useState<ProgressInsight[]>(initialInsights);
    const [page, setPage] = useState(2);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
    const { decrementProgress } = useSidebarBadgeStore();

    const handleInsightViewed = (id: string) => {
        setViewedIds((prev) => new Set([...prev, id]));
        decrementProgress();
    };

    const enrichedInsights = useMemo(
        () =>
            insights.map((insight) => ({
                ...insight,
                isViewed: insight.isViewed || viewedIds.has(insight.id),
            })),
        [insights, viewedIds],
    );

    const filtered = useMemo(
        () =>
            dateRange?.from
                ? enrichedInsights.filter((i) =>
                      isInsightInRange(i.createdAt, dateRange),
                  )
                : enrichedInsights,
        [enrichedInsights, dateRange],
    );

    const fetchMore = useCallback(async () => {
        const res = await fetch(
            `/api/progress-insights?page=${page}&pageSize=${PAGE_SIZE}`,
        );

        if (!res.ok) return;

        const json = (await res.json()) as {
            data?: { insights: ProgressInsight[]; hasMore: boolean };
        };

        const { insights: newInsights, hasMore: nextHasMore } = json.data ?? {
            insights: [],
            hasMore: false,
        };
        if (newInsights.length > 0) {
            setInsights((prev) => [...prev, ...newInsights]);
            setPage((prev) => prev + 1);
        }
        setHasMore(nextHasMore);
    }, [page]);

    const { sentinelRef, isFetching } = useInfiniteScroll({
        hasMore,
        fetchMore,
        rootMargin: "300px",
        threshold: 0,
    });
    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader>
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="font-serif text-4xl italic text-zinc-600">
                        Progress
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Deep synthesis generated every{" "}
                        <strong className="font-medium text-zinc-600">
                            15 entries
                        </strong>
                        . A mirror for your evolving mind.
                    </p>
                </div>
            </PageHeader>

            <ProgressHeaderBar
                totalEntries={totalEntries}
                totalInsights={totalInsights}
                entryCountAtLastProgress={entryCountAtLastProgress}
            />

            <div className="flex-1 overflow-y-auto">
                {insights.length === 0 ? (
                    <ProgressEmptyState />
                ) : (
                    <div className="flex flex-col gap-6 px-10 py-8">
                        {/* Calendar filter */}
                        <div className="flex items-center gap-2">
                            <DateFilter
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                popoverAlign="start"
                            />
                            <hr className="flex-1 border-zinc-200" />
                        </div>

                        {/* Card grid */}
                        {filtered.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <p>No reflections match your date filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {filtered.map((insight) => (
                                    <ProgressCard
                                        key={insight.id}
                                        insight={insight}
                                        onViewed={handleInsightViewed}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sentinel — fires 300px before the user reaches the bottom */}
                <div ref={sentinelRef} className="h-1" />

                {isFetching && (
                    <div className="flex justify-center py-4">
                        <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    </div>
                )}
            </div>
        </div>
    );
};

export { ProgressView };
