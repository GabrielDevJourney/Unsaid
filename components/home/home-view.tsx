"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
    EntryCardGrid,
    type EntryItem,
} from "@/components/home/entry-card-grid";
import type { TagName } from "@/components/home/entry-tag";
import { HomeAside } from "@/components/home/home-aside";
import { HomeToolbar } from "@/components/home/home-toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface HomeViewProps {
    entries: EntryItem[];
    totalEntries: number;
    userName: string;
}

const HomeView = ({ entries, totalEntries, userName }: HomeViewProps) => {
    const [isAsideOpen, setIsAsideOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<Set<TagName>>(new Set());
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isScrolled, setIsScrolled] = useState(false);

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

    const filteredEntries = entries.filter((item) => {
        if (
            selectedTags.size > 0 &&
            !(item.tags ?? []).some((tag) => selectedTags.has(tag))
        ) {
            return false;
        }

        if (dateRange?.from) {
            const entryDate = new Date(item.entry.createdAt);
            if (entryDate < dateRange.from) return false;
            if (dateRange.to && entryDate > dateRange.to) return false;
        }

        return true;
    });

    return (
        <div className="flex h-full">
            {/* Left column: page header + scrollable content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <PageHeader>
                    <div>
                        <h1 className="font-serif text-4xl text-zinc-600 italic">
                            Good evening {userName}!
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
                            {entries?.length > 0 ? (
                                <HomeToolbar
                                    selectedTags={selectedTags}
                                    dateRange={dateRange}
                                    isScrolled={isScrolled}
                                    onToggleTag={toggleTag}
                                    onClearTags={() =>
                                        setSelectedTags(new Set())
                                    }
                                    onDateRangeChange={setDateRange}
                                    onToggleAside={() => setIsAsideOpen(true)}
                                />
                            ) : (
                                <div className="mb-6 flex items-start justify-between py-2">
                                    <div>
                                        <h2 className="font-serif text-5xl text-zinc-600 italic">
                                            Build your mind temple
                                        </h2>
                                        <p className="mt-1 text-muted-foreground">
                                            One entry at a time, create a space
                                            for your thoughts, emotions, and
                                            self-discovery.
                                        </p>
                                    </div>
                                    <Button
                                        variant="sunrise"
                                        className="shrink-0 ring-4 ring-border gap-2"
                                    >
                                        <HugeiconsIcon
                                            icon={Add01Icon}
                                            className="size-5 text-white"
                                        />
                                        <span className="text-sm font-medium text-white">
                                            New entry
                                        </span>
                                    </Button>
                                </div>
                            )}

                            <EntryCardGrid
                                entries={filteredEntries}
                                totalEntries={
                                    entries.length === 0 ? 0 : totalEntries
                                }
                            />
                        </div>
                    </div>

                    {/* Bottom fade -- cards scroll behind this */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent" />
                </div>
            </div>

            {/* Right aside -- desktop (xl+) */}
            <aside className="hidden w-73 shrink-0 overflow-y-auto border-l xl:flex">
                <HomeAside />
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
                    <HomeAside />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export { HomeView, type HomeViewProps };
