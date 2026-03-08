"use client";

import { Add01Icon, PanelLeftOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { HomeEmptyBanner } from "@/components/home/home-empty-banner";
import { Toolbar } from "@/components/shared/toolbar";
import { Button } from "@/components/ui/button";
import { ALL_TAG_NAMES, TAG_STYLES, type TagName } from "./entry-tag";

const TAG_OPTIONS = ALL_TAG_NAMES.map((tag) => ({
    value: tag,
    label: tag,
    color: TAG_STYLES[tag],
}));

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
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onToggleTag: (tag: TagName) => void;
    onClearTags: () => void;
    onDateRangeChange: (range: DateRange | undefined) => void;
}

type HomeToolbarProps = HomeToolbarEmpty | HomeToolbarWithFilters;

const HomeToolbar = (props: HomeToolbarProps) => {
    const actions = (
        <>
            <Button variant="sunrise" asChild>
                <Link href="/entries/new">
                    <HugeiconsIcon
                        icon={Add01Icon}
                        className="size-5 text-white"
                    />
                    <span className="text-sm font-medium text-white">
                        New entry
                    </span>
                </Link>
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="bg-card xl:hidden"
                onClick={props.onToggleAside}
            >
                <HugeiconsIcon icon={PanelLeftOpenIcon} className="size-5" />
                <span className="sr-only">Open aside panel</span>
            </Button>
        </>
    );

    if (props.isEmpty) {
        return (
            <div
                className={`sticky top-0 z-30 mb-6 flex items-center gap-3 bg-background py-2 ${props.isScrolled ? "border-b border-border" : ""}`}
            >
                <HomeEmptyBanner />
                {actions}
            </div>
        );
    }

    return (
        <Toolbar
            isScrolled={props.isScrolled}
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            searchPlaceholder="Search entries..."
            filterOptions={TAG_OPTIONS}
            selectedFilters={props.selectedTags as Set<string>}
            onToggleFilter={props.onToggleTag as (value: string) => void}
            onClearFilters={props.onClearTags}
            filterLabel="tag"
            dateRange={props.dateRange}
            onDateRangeChange={props.onDateRangeChange}
            actions={actions}
        />
    );
};

export { HomeToolbar, type HomeToolbarProps };
