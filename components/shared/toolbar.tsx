"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { DateRange } from "react-day-picker";
import { DateFilter } from "@/components/home/date-filter";
import { Input } from "@/components/ui/input";
import { FilterBadges, type FilterOption } from "./filter-badges";

interface ToolbarProps {
    isScrolled: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    filterOptions: FilterOption[];
    selectedFilters: Set<string>;
    onToggleFilter: (value: string) => void;
    onClearFilters: () => void;
    filterLabel?: string;
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    actions?: React.ReactNode;
}

const Toolbar = ({
    isScrolled,
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filterOptions,
    selectedFilters,
    onToggleFilter,
    onClearFilters,
    filterLabel,
    dateRange,
    onDateRangeChange,
    actions,
}: ToolbarProps) => (
    <div
        className={`sticky top-0 z-30 mb-6 flex items-center gap-3 bg-background py-2 ${isScrolled ? "border-b border-border" : ""}`}
    >
        <div className="relative flex-1">
            <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 rounded-lg bg-card pl-9 text-muted-foreground font-medium"
            />
        </div>

        <FilterBadges
            options={filterOptions}
            selected={selectedFilters}
            onToggle={onToggleFilter}
            onClear={onClearFilters}
            label={filterLabel}
        />

        <DateFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
        />

        {actions}
    </div>
);

export { Toolbar, type ToolbarProps };
