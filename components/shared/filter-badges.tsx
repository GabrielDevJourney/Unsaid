"use client";

import { Flag03Icon } from "@hugeicons/core-free-icons";
import { FilterButton } from "@/components/home/filter-button";
import { FilterBadge } from "./filter-badge";

interface FilterOption {
    value: string;
    label: string;
    color?: string;
}

interface FilterBadgesProps {
    options: FilterOption[];
    selected: Set<string>;
    onToggle: (value: string) => void;
    onClear: () => void;
    label?: string;
}

const FilterBadges = ({
    options,
    selected,
    onToggle,
    onClear,
    label = "type",
}: FilterBadgesProps) => (
    <FilterButton
        icon={Flag03Icon}
        label={`Filter by ${label}`}
        isActive={selected.size > 0}
        popoverAlign="start"
        popoverClassName="w-72 p-3"
    >
        <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Filter by {label}</p>
            {selected.size > 0 && (
                <button
                    type="button"
                    onClick={onClear}
                    className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                >
                    Clear all
                </button>
            )}
        </div>
        <div className="flex flex-wrap gap-1.5">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onToggle(option.value)}
                    className="cursor-pointer"
                >
                    <FilterBadge
                        label={option.label}
                        active={selected.has(option.value)}
                        color={option.color}
                    />
                </button>
            ))}
        </div>
    </FilterButton>
);

export { FilterBadges, type FilterBadgesProps, type FilterOption };
