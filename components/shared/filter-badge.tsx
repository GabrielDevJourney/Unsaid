import { cn } from "@/lib/utils";

const INACTIVE_STYLE = "border-zinc-300 bg-zinc-100 text-zinc-500";

interface FilterBadgeProps {
    label: string;
    active: boolean;
    color?: string;
    className?: string;
}

const FilterBadge = ({ label, active, color, className }: FilterBadgeProps) => (
    <span
        className={cn(
            "inline-flex h-7 items-center rounded-sm border px-2 text-xs font-medium transition-colors",
            active && color ? color : INACTIVE_STYLE,
            className,
        )}
    >
        {label}
    </span>
);

export { FilterBadge, type FilterBadgeProps };
