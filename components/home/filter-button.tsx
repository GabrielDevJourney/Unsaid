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
    popoverAlign?: "start" | "end";
    popoverClassName?: string;
    children: React.ReactNode;
}

const FilterButton = ({
    icon,
    label,
    isActive,
    popoverAlign = "start",
    popoverClassName,
    children,
}: FilterButtonProps) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                size="icon-lg"
                className={`bg-accent hover:bg-white ${isActive ? "border-slate-500 bg-white" : ""}`}
            >
                <HugeiconsIcon icon={icon} className="size-5" />
                <span className="sr-only">{label}</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent align={popoverAlign} className={popoverClassName}>
            {children}
        </PopoverContent>
    </Popover>
);

export { FilterButton, type FilterButtonProps };
