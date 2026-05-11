"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
    EntryCardGrid,
    type EntryItem,
} from "@/components/home/entry-card-grid";
import type { TagName } from "@/components/home/entry-tag";
import { HomeAside } from "@/components/home/home-aside";
import { HomeToolbar } from "@/components/home/home-toolbar";
import { PageHeader } from "@/components/layout/page-header";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import type { EntryWithInsight, EntryWithSimilarity } from "@/types";
import { UpgradeBanner } from "../shared/upgrade-banner";

const PAGE_SIZE = 20;

interface HomeViewProps {
    entries: EntryItem[];
    initialHasMore: boolean;
    userName: string;
    totalEntriesAllTime: number;
    totalPatternsCount: number;
    entryDates: string[];
    needsSummary?: boolean;
}

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
};

const HomeView = ({
    entries: initialEntries,
    initialHasMore,
    userName,
    totalEntriesAllTime,
    totalPatternsCount,
    entryDates,
    needsSummary,
}: HomeViewProps) => {
    const router = useRouter();
    const [entries, setEntries] = useState<EntryItem[]>(initialEntries);
    const [page, setPage] = useState(2);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isAsideOpen, setIsAsideOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<Set<TagName>>(new Set());
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isScrolled, setIsScrolled] = useState(false);
    const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<EntryItem[] | null>(
        null,
    );
    const [isSearching, setIsSearching] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 400);

    const fetchMore = useCallback(async () => {
        const res = await fetch(
            `/api/entries?page=${page}&pageSize=${PAGE_SIZE}`,
        );
        if (!res.ok) return;

        const json = (await res.json()) as {
            data?: EntryWithInsight[];
            pagination?: { hasMore: boolean };
        };

        if (json.data && json.data.length > 0) {
            setEntries((prev) => [
                ...prev,
                ...(json.data ?? []).map((entry) => ({ entry })),
            ]);
            setPage((prev) => prev + 1);
        }
        setHasMore(json.pagination?.hasMore ?? false);
    }, [page]);

    const { sentinelRef, isFetching } = useInfiniteScroll({
        hasMore,
        fetchMore,
        rootMargin: "300px",
        threshold: 0,
        enabled: searchResults === null,
    });

    useEffect(() => {
        setDeletedIds((prev) => {
            if (prev.size === 0) return prev;
            const serverIds = new Set(entries.map((e) => e.entry.id));
            const next = new Set([...prev].filter((id) => serverIds.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [entries]);

    useEffect(() => {
        if (!needsSummary) return;
        fetch("/api/persona/summary", { method: "POST" }).catch(() => {});
    }, [needsSummary]);

    const handleEntryDeleted = useCallback(
        (entryId: string) => {
            setDeletedIds((prev) => new Set([...prev, entryId]));
            router.refresh();
        },
        [router],
    );

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
                    `/api/entries/search?q=${encodeURIComponent(debouncedQuery)}&threshold=0.4`,
                    { signal: controller.signal },
                );
                if (!res.ok) return;

                const json = (await res.json()) as {
                    data?: { entries: EntryWithSimilarity[] };
                };
                if (json.data) {
                    setSearchResults(
                        json.data.entries.map((searchEntry) => ({
                            entry: searchEntry,
                        })),
                    );
                }
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

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 0);
    }, []);

    const toggleTag = (tag: TagName) => {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) {
                next.delete(tag);
            } else {
                next.add(tag);
            }
            return next;
        });
    };

    const activeEntries = entries.filter((e) => !deletedIds.has(e.entry.id));
    const activeTotal = totalEntriesAllTime - deletedIds.size;

    const filteredEntries = activeEntries.filter((item) => {
        if (selectedTags.size > 0) {
            const entryTags = (item.entry.entryInsight?.tags ??
                []) as TagName[];
            if (!entryTags.some((tag) => selectedTags.has(tag))) return false;
        }

        if (dateRange?.from) {
            const entryDate = new Date(item.entry.createdAt);
            if (entryDate < dateRange.from) return false;
            if (dateRange.to) {
                const endOfDay = new Date(dateRange.to);
                endOfDay.setHours(23, 59, 59, 999);
                if (entryDate > endOfDay) return false;
            }
        }

        return true;
    });

    return (
        <div className="flex h-full">
            {/* Left column: page header + scrollable content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <PageHeader>
                    <div className="px-2">
                        <h1 className="font-serif text-4xl text-zinc-600 italic">
                            {getGreeting()} {userName}!
                        </h1>
                    </div>
                </PageHeader>

                {/* Scrollable content area */}
                <div className="relative min-h-0 flex-1">
                    <div
                        className="h-full overflow-y-auto"
                        onScroll={handleScroll}
                    >
                        <div className="w-full px-6 py-6 ">
                            {activeEntries.length === 0 ? (
                                <HomeToolbar
                                    isEmpty
                                    isScrolled={isScrolled}
                                    onToggleAside={() => setIsAsideOpen(true)}
                                />
                            ) : (
                                <HomeToolbar
                                    isEmpty={false}
                                    isScrolled={isScrolled}
                                    onToggleAside={() => setIsAsideOpen(true)}
                                    selectedTags={selectedTags}
                                    dateRange={dateRange}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onToggleTag={toggleTag}
                                    onClearTags={() =>
                                        setSelectedTags(new Set())
                                    }
                                    onDateRangeChange={setDateRange}
                                />
                            )}

                            <UpgradeBanner />

                            {isSearching ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                                </div>
                            ) : (
                                <EntryCardGrid
                                    entries={searchResults ?? filteredEntries}
                                    totalEntries={
                                        activeEntries.length === 0
                                            ? 0
                                            : activeTotal
                                    }
                                    onEntryDeleted={handleEntryDeleted}
                                />
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

                    {/* Bottom fade -- cards scroll behind this */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent" />
                </div>
            </div>

            {/* Right aside -- desktop (xl+) */}
            <aside className="hidden w-73 shrink-0 overflow-y-auto border-l xl:flex">
                <HomeAside
                    totalEntries={activeTotal}
                    totalPatternsCount={totalPatternsCount}
                    entryDates={entryDates}
                />
            </aside>

            {/* Right aside -- mobile/tablet Sheet (below xl) */}
            <Sheet open={isAsideOpen} onOpenChange={setIsAsideOpen}>
                <SheetContent side="right" className="w-70 p-0 sm:max-w-70">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Aside panel</SheetTitle>
                        <SheetDescription>
                            Date, stats, and calendar
                        </SheetDescription>
                    </SheetHeader>
                    <HomeAside
                        totalEntries={activeTotal}
                        totalPatternsCount={totalPatternsCount}
                        entryDates={entryDates}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export { HomeView, type HomeViewProps };
