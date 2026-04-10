import { Calendar04Icon } from "@hugeicons/core-free-icons";
import type { DateRange } from "react-day-picker";

import { FilterButton } from "@/components/shared/filter-button";
import { Calendar } from "@/components/ui/calendar";

interface DateFilterProps {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    popoverAlign?: "start" | "end";
    showLabel?: boolean;
}

const DateFilter = ({
    dateRange,
    onDateRangeChange,
    popoverAlign = "end",
    showLabel = false,
}: DateFilterProps) => (
    <FilterButton
        icon={Calendar04Icon}
        label="Calendar"
        isActive={!!dateRange?.from}
        showLabel={showLabel}
        popoverAlign={popoverAlign}
        popoverClassName="w-auto p-0 rounded-xl shadow-lg"
    >
        <div className="flex items-center justify-between px-4 pt-3">
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
            defaultMonth={new Date()}
        />
    </FilterButton>
);

export { DateFilter, type DateFilterProps };
