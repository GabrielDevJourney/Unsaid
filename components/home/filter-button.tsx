import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface FilterButtonProps {
    icon: IconSvgElement;
    label: string;
    isActive: boolean;
    showLabel?: boolean;
    popoverAlign?: "start" | "end";
    popoverClassName?: string;
    children: React.ReactNode;
}

const FilterButton = ({
    icon,
    label,
    isActive,
    showLabel = false,
    popoverAlign = "start",
    popoverClassName,
    children,
}: FilterButtonProps) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                size={showLabel ? "sm" : "icon-lg"}
                className={`bg-accent hover:bg-white ${isActive ? "border-slate-500 bg-white" : ""}`}
            >
                <HugeiconsIcon icon={icon} className="size-4" />
                {showLabel ? (
                    <span className="text-sm text-zinc-600">{label}</span>
                ) : (
                    <span className="sr-only">{label}</span>
                )}
            </Button>
        </PopoverTrigger>
        <PopoverContent align={popoverAlign} className={popoverClassName}>
            {children}
        </PopoverContent>
    </Popover>
);

export { FilterButton, type FilterButtonProps };
