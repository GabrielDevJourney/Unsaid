"use client";

import {
    ArrowUpRight03Icon,
    Chart03Icon,
    Clock01Icon,
    Flag03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterButton } from "@/components/shared/filter-button";
import { FEEDBACK_STATUS_CONFIG } from "@/lib/constants/feedback-status-types";
import type {
    FeedbackSortType,
    FeedbackStatusType,
} from "@/lib/schemas/feedback";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: {
    value: FeedbackSortType;
    label: string;
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
}[] = [
    { value: "relevant", label: "Most Relevant", icon: Chart03Icon },
    { value: "recent", label: "Most Recent", icon: Clock01Icon },
    { value: "upvoted", label: "Most Upvoted", icon: ArrowUpRight03Icon },
];

const STATUS_ENTRIES = Object.entries(FEEDBACK_STATUS_CONFIG) as [
    Exclude<FeedbackStatusType, "open">,
    { label: string; color: string },
][];

interface FeedbackFilterProps {
    sort: FeedbackSortType;
    onSortChange: (sort: FeedbackSortType) => void;
    statusFilter: Set<FeedbackStatusType>;
    onStatusFilterChange: (filter: Set<FeedbackStatusType>) => void;
}

const FeedbackFilter = ({
    sort,
    onSortChange,
    statusFilter,
    onStatusFilterChange,
}: FeedbackFilterProps) => {
    const toggleStatus = (status: Exclude<FeedbackStatusType, "open">) => {
        const next = new Set(statusFilter);
        if (next.has(status)) {
            next.delete(status);
        } else {
            next.add(status);
        }
        onStatusFilterChange(next);
    };

    return (
        <FilterButton
            icon={Flag03Icon}
            label="Filter"
            isActive={statusFilter.size > 0 || sort !== "relevant"}
            popoverAlign="end"
            popoverClassName="w-52 p-0"
        >
            {/* Sort */}
            <div className="flex flex-col gap-0.5 px-2 py-3">
                {SORT_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onSortChange(opt.value)}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                            sort === opt.value
                                ? "border border-zinc-300 bg-accent font-medium text-foreground"
                                : "border border-transparent text-zinc-600 hover:bg-accent/60",
                        )}
                    >
                        <HugeiconsIcon
                            icon={opt.icon}
                            className="size-4 shrink-0 text-zinc-500"
                        />
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="border-t border-border" />

            {/* Status filter */}
            <div className="flex flex-wrap gap-2 px-2 py-3">
                {STATUS_ENTRIES.map(([value, { label, color }]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => toggleStatus(value)}
                        className={cn(
                            "rounded-sm border px-2 py-1 text-xs font-medium transition-colors",
                            statusFilter.has(value)
                                ? color
                                : "border-border bg-background text-zinc-600 hover:border-zinc-400",
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </FilterButton>
    );
};

export { FeedbackFilter };
