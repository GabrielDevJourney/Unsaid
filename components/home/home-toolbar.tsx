"use client";

import {
    Add01Icon,
    PanelLeftOpenIcon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { DateRange } from "react-day-picker";

import { DateFilter } from "@/components/home/date-filter";
import type { TagName } from "@/components/home/entry-tag";
import { HomeEmptyBanner } from "@/components/home/home-empty-banner";
import { TagFilter } from "@/components/home/tag-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HomeToolbarBase {
    isScrolled: boolean;
    onToggleAside: () => void;
}

interface HomeToolbarEmpty extends HomeToolbarBase {
    isEmpty: true;
}

interface HomeToolbarWithFilters extends HomeToolbarBase {
    isEmpty: false;
    selectedTags: Set<TagName>;
    dateRange: DateRange | undefined;
    onToggleTag: (tag: TagName) => void;
    onClearTags: () => void;
    onDateRangeChange: (range: DateRange | undefined) => void;
}

type HomeToolbarProps = HomeToolbarEmpty | HomeToolbarWithFilters;

const HomeToolbar = (props: HomeToolbarProps) => {
    return (
        <div
            className={`sticky top-0 z-30 mb-6 flex items-center gap-3 bg-background py-2 ${props.isScrolled ? "border-b border-border" : ""}`}
        >
            {props.isEmpty ? (
                <HomeEmptyBanner />
            ) : (
                <>
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

                    <TagFilter
                        selectedTags={props.selectedTags}
                        onToggleTag={props.onToggleTag}
                        onClearTags={props.onClearTags}
                    />

                    <DateFilter
                        dateRange={props.dateRange}
                        onDateRangeChange={props.onDateRangeChange}
                    />
                </>
            )}

            {/* New entry button — always visible */}
            <Button variant="sunrise" className="ring-4 ring-zinc-300 gap-2">
                <HugeiconsIcon icon={Add01Icon} className="size-5 text-white" />
                <span className="text-sm font-medium text-white">
                    New entry
                </span>
            </Button>

            {/* Aside toggle — visible only below xl */}
            <Button
                variant="outline"
                size="icon"
                className="bg-card xl:hidden"
                onClick={props.onToggleAside}
            >
                <HugeiconsIcon icon={PanelLeftOpenIcon} className="size-5" />
                <span className="sr-only">Open aside panel</span>
            </Button>
        </div>
    );
};

export { HomeToolbar, type HomeToolbarProps };
