"use client";

import {
    Add01Icon,
    Calendar04Icon,
    Flag03Icon,
    PanelLeftOpenIcon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { DateRange } from "react-day-picker";

import {
    ALL_TAG_NAMES,
    EntryTag,
    type TagName,
} from "@/components/home/entry-tag";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface HomeToolbarProps {
    selectedTags: Set<TagName>;
    dateRange: DateRange | undefined;
    isScrolled: boolean;
    onToggleTag: (tag: TagName) => void;
    onClearTags: () => void;
    onDateRangeChange: (range: DateRange | undefined) => void;
    onToggleAside: () => void;
}

const HomeToolbar = ({
    selectedTags,
    dateRange,
    isScrolled,
    onToggleTag,
    onClearTags,
    onDateRangeChange,
    onToggleAside,
}: HomeToolbarProps) => {
    return (
        <div
            className={`sticky top-0 z-30 mb-6 flex items-center gap-3 bg-background py-2 ${isScrolled ? "border-b border-border" : ""}`}
        >
            {/* Search input */}
            <div className="relative flex-1">
                <HugeiconsIcon
                    icon={Search01Icon}
                    className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    placeholder="Search..."
                    className="h-10 rounded-lg bg-card pl-9 text-muted-foreground font-medium"
                />
            </div>

            {/* Tag filter popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-lg"
                        className={`bg-accent ${selectedTags.size > 0 ? "border-foreground" : ""}`}
                    >
                        <HugeiconsIcon
                            icon={Flag03Icon}
                            className="size-5"
                        />
                        <span className="sr-only">Filter by tags</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium">Filter by tag</p>
                        {selectedTags.size > 0 && (
                            <button
                                type="button"
                                onClick={onClearTags}
                                className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {ALL_TAG_NAMES.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onToggleTag(tag)}
                                className="cursor-pointer"
                            >
                                <EntryTag
                                    name={tag}
                                    active={selectedTags.has(tag)}
                                />
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Calendar filter popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-lg"
                        className={`bg-accent ${dateRange?.from ? "border-foreground" : ""}`}
                    >
                        <HugeiconsIcon
                            icon={Calendar04Icon}
                            className="size-5"
                        />
                        <span className="sr-only">Filter by date</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                    <div className="flex items-center justify-between px-4 pt-3">
                        <p className="text-sm font-medium">Filter by date</p>
                        {dateRange?.from && (
                            <button
                                type="button"
                                onClick={() => onDateRangeChange(undefined)}
                                className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={onDateRangeChange}
                        numberOfMonths={2}
                        defaultMonth={new Date(2025, 0)}
                    />
                </PopoverContent>
            </Popover>

            {/* New entry button */}
            <Button variant="sunrise" className="ring-4 ring-border gap-2">
                <HugeiconsIcon
                    icon={Add01Icon}
                    className="size-5 text-white"
                />
                <span className="text-sm font-medium text-white">
                    New entry
                </span>
            </Button>

            {/* Aside toggle -- visible only below xl */}
            <Button
                variant="outline"
                size="icon"
                className="bg-card xl:hidden"
                onClick={onToggleAside}
            >
                <HugeiconsIcon
                    icon={PanelLeftOpenIcon}
                    className="size-5"
                />
                <span className="sr-only">Open aside panel</span>
            </Button>
        </div>
    );
};

export { HomeToolbar, type HomeToolbarProps };
