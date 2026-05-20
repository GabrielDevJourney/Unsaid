"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { PageHeader } from "@/components/layout/page-header";
import { DateFilter } from "@/components/shared/date-filter";
import { Button } from "@/components/ui/button";
import type {
    FeedbackSortType,
    FeedbackStatusType,
} from "@/lib/schemas/feedback";
import type { FeedbackItemWithVote } from "@/types";
import { SearchInput } from "../shared/search-input";
import { FeedbackCard } from "./feedback-card";
import { FeedbackEmptyState } from "./feedback-empty-state";
import { FeedbackFilter } from "./feedback-filter";
import { SubmitFeedbackDialog } from "./submit-feedback-dialog";

interface FeedbackViewProps {
    initialItems: FeedbackItemWithVote[];
    userFirstName: string;
    userAvatarUrl: string | null;
}

const FeedbackView = ({
    initialItems,
    userFirstName,
    userAvatarUrl,
}: FeedbackViewProps) => {
    const [items, setItems] = useState<FeedbackItemWithVote[]>(initialItems);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<FeedbackSortType>("relevant");
    const [statusFilter, setStatusFilter] = useState<Set<FeedbackStatusType>>(
        new Set(),
    );
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filtered = useMemo(() => {
        let result = [...items];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q),
            );
        }

        if (statusFilter.size > 0) {
            result = result.filter((item) => statusFilter.has(item.status));
        }

        if (dateRange?.from) {
            const from = dateRange.from.getTime();
            const to = dateRange.to ? dateRange.to.getTime() : from;
            result = result.filter((item) => {
                const t = new Date(item.created_at).getTime();
                return t >= from && t <= to + 86_400_000;
            });
        }

        if (sort === "recent") {
            result.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            );
        } else if (sort === "upvoted") {
            result.sort((a, b) => b.upvote_count - a.upvote_count);
        } else {
            result.sort((a, b) => {
                if (b.upvote_count !== a.upvote_count)
                    return b.upvote_count - a.upvote_count;
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            });
        }

        return result;
    }, [items, search, sort, statusFilter, dateRange]);

    const handleUpvoteToggle = (
        feedbackId: string,
        newState: { hasVoted: boolean },
    ) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== feedbackId) return item;
                const delta = newState.hasVoted ? 1 : -1;
                return {
                    ...item,
                    hasVoted: newState.hasVoted,
                    upvote_count: Math.max(0, item.upvote_count + delta),
                };
            }),
        );
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref="/home">
                <h1 className="font-serif text-2xl md:text-4xl italic text-zinc-600">
                    Feedback
                </h1>
                <p className="hidden lg:block ml-auto text-sm text-neutral-400">
                    Help shape the{" "}
                    <span className="font-bold text-neutral-400">
                        future of Unsaid
                    </span>
                </p>
            </PageHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-8 lg:px-10">
                    {/* Controls row — only shown when there are items */}
                    <div
                        className={`mb-6 sticky top-0 z-30 flex items-center gap-3 bg-background py-2 pr-2 ${items.length === 0 ? "hidden" : ""}`}
                    >
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search feedback..."
                        />

                        <div className="flex items-center gap-3 ml-auto md:ml-0">
                            <FeedbackFilter
                                sort={sort}
                                onSortChange={setSort}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                            />

                            <DateFilter
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                popoverAlign="end"
                            />

                            <Button
                                variant="sunrise"
                                size="icon-lg"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <HugeiconsIcon
                                    icon={Add01Icon}
                                    className="size-4 text-white"
                                />
                            </Button>
                        </div>
                    </div>

                    {/* Feedback list */}
                    {items.length === 0 ? (
                        <FeedbackEmptyState
                            onSubmitClick={() => setIsDialogOpen(true)}
                        />
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No feedback matches your filters.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filtered.map((item) => (
                                <FeedbackCard
                                    key={item.id}
                                    item={item}
                                    isExpanded={expandedId === item.id}
                                    onToggleExpand={() =>
                                        setExpandedId((prev) =>
                                            prev === item.id ? null : item.id,
                                        )
                                    }
                                    onUpvoteToggle={handleUpvoteToggle}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SubmitFeedbackDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                userFirstName={userFirstName}
                userAvatarUrl={userAvatarUrl}
            />
        </div>
    );
};

export { FeedbackView };
