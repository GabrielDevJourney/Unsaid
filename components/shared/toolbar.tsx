"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DateFilter } from "@/components/shared/date-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterBadges, type FilterOption } from "./filter-badges";

const SEARCH_OVERLAY_TRANSITION = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4,
} as const;

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
}: ToolbarProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input after overlay mounts
    useEffect(() => {
        if (!isSearchOpen) return;
        const id = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(id);
    }, [isSearchOpen]);

    // Close on click outside the overlay
    useEffect(() => {
        if (!isSearchOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(e.target as Node)
            ) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen]);

    return (
        <div
            className={`relative sticky top-0 z-30 mb-6 flex items-center gap-3 bg-background py-2 ${isScrolled ? "border-b border-border" : ""}`}
        >
            {/* Mobile: compact search icon button — same size as filter/calendar (icon-lg = size-10) */}
            <Button
                variant="outline"
                size="icon-lg"
                className={`md:hidden bg-card shrink-0 ${searchQuery.length > 0 ? "ring-2 ring-zinc-400" : ""}`}
                onClick={() => setIsSearchOpen(true)}
            >
                <HugeiconsIcon
                    icon={Search01Icon}
                    className="size-4 text-muted-foreground"
                />
            </Button>

            {/* Desktop: inline search input */}
            <div className="relative hidden md:flex flex-1">
                <HugeiconsIcon
                    icon={Search01Icon}
                    className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 w-full rounded-lg bg-card pl-9 text-muted-foreground font-medium"
                />
            </div>

            {/* Right-aligned group on mobile; natural flow on desktop */}
            <div className="flex items-center gap-3 ml-auto md:ml-0">
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

            {/* Mobile search overlay — Framer Motion slide from/to left */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        ref={overlayRef}
                        className="md:hidden absolute inset-0 z-10 flex items-center gap-2 bg-background py-2"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={SEARCH_OVERLAY_TRANSITION}
                    >
                        <div className="relative flex-1">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                ref={inputRef}
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape")
                                        setIsSearchOpen(false);
                                }}
                                className="h-10 rounded-lg bg-card pl-9 text-muted-foreground font-medium"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="shrink-0"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <HugeiconsIcon
                                icon={Cancel01Icon}
                                className="size-4 text-muted-foreground"
                            />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { Toolbar, type ToolbarProps };
