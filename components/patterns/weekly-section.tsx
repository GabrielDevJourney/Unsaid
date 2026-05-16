"use client";

import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { WeeklyInsightWithPatterns } from "@/types";
import { PatternCard } from "./pattern-card";

interface WeeklySectionProps {
    insight: WeeklyInsightWithPatterns;
    defaultOpen?: boolean;
    onPatternViewed?: (id: string) => void;
}

const formatWeekLabel = (weekStart: string): string => {
    const date = new Date(weekStart);
    return formatDate(date, {
        year: "numeric",
        month: "long",
        day: "2-digit",
    }).toLocaleLowerCase();
};

const WeeklySection = ({
    insight,
    defaultOpen = false,
    onPatternViewed,
}: WeeklySectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const weekLabel = formatWeekLabel(insight.weekStart);

    return (
        <div className="flex flex-col gap-4">
            {/* Accordion trigger row — icon › label ── separator */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex items-center gap-2 group shrink-0"
                >
                    <HugeiconsIcon
                        icon={isOpen ? ArrowDown01Icon : ArrowRight01Icon}
                        className={cn(
                            "size-4 transition-colors",
                            "text-muted-foreground group-hover:text-zinc-700",
                        )}
                        strokeWidth={1.5}
                    />
                    <span className="font-sans text-sm text-[#828282] group-hover:text-zinc-700 transition-colors">
                        {weekLabel}
                    </span>
                </button>

                <div className="flex-1 h-px bg-border" />
            </div>

            {isOpen && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {insight.patterns.map((pattern) => (
                        <PatternCard
                            key={pattern.id}
                            pattern={pattern}
                            onViewed={onPatternViewed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { WeeklySection, type WeeklySectionProps };
