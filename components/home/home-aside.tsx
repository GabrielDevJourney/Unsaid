import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMonthName } from "@/lib/date-utils";
import { HomeAsideIcon } from "../icons/home-aside-icon";

interface HomeAsideProps {
    totalEntries: number;
    weeklyInsightsCount: number;
    entryDates: string[];
}

const buildCalendarGrid = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

    const grid: (number | null)[][] = [];
    let currentDay = 1;

    const firstRow: (number | null)[] = Array.from<null>({
        length: startDayOffset,
    }).fill(null);
    while (firstRow.length < 7 && currentDay <= daysInMonth) {
        firstRow.push(currentDay++);
    }
    grid.push(firstRow);

    while (currentDay <= daysInMonth) {
        const row: (number | null)[] = [];
        for (let i = 0; i < 7 && currentDay <= daysInMonth; i++) {
            row.push(currentDay++);
        }
        while (row.length < 7) row.push(null);
        grid.push(row);
    }

    return grid;
};

const HomeAside = ({
    totalEntries,
    weeklyInsightsCount,
    entryDates,
}: HomeAsideProps) => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLabel = getMonthName(currentYear, currentMonth);

    const entryDaySet = new Set(
        entryDates
            .filter((dateStr) => {
                const d = new Date(dateStr);
                return (
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear
                );
            })
            .map((dateStr) => new Date(dateStr).getDate()),
    );

    const calendarSlots = buildCalendarGrid(currentYear, currentMonth).flatMap(
        (row, rowIndex) =>
            row.map((day, colIndex) => ({
                key:
                    day !== null
                        ? `day-${day}`
                        : `empty-${rowIndex}-${colIndex}`,
                day,
            })),
    );

    return (
        <div className="flex h-full flex-col w-full">
            {/* Date + Stats -- 2x2 grid, first row 2x height of second */}
            <div className="grid h-78 grid-cols-2 grid-rows-[6fr_3fr]">
                {/* Row 1, Col 1: empty */}
                <div className="border-r border-b" />

                {/* Row 1, Col 2: icon + day + month */}
                <div className="flex flex-col items-center justify-center border-b">
                    <div className="flex flex-col items-end">
                        <div className="flex flex-col items-end gap-4">
                            <HomeAsideIcon />
                            <span className="font-serif text-[54px] leading-none text-zinc-600 italic">
                                {currentDay}
                            </span>
                        </div>

                        <span className="text-xl text-gray-500">
                            {monthLabel}
                        </span>
                    </div>
                </div>

                {/* Row 2, Col 1: written entries */}
                <div className="flex flex-col items-center justify-center text-zinc-600 border-r border-b">
                    <div className="flex flex-col justify-start">
                        <span className="font-serif text-2xl italic">
                            {totalEntries}
                        </span>
                        <span className="text-xs leading-tight text-muted-foreground">
                            written
                            <br />
                            entries
                        </span>
                    </div>
                </div>

                {/* Row 2, Col 2: weekly insights */}
                <div className="flex flex-col items-center justify-center border-b text-zinc-600">
                    <div className="flex flex-col justify-start">
                        <span className="font-serif text-2xl italic">
                            {weeklyInsightsCount}
                        </span>
                        <span className="text-xs leading-tight text-muted-foreground">
                            weekly
                            <br />
                            insights
                        </span>
                    </div>
                </div>
            </div>

            {/* Mini calendar */}
            <div className="flex flex-col gap-2 border-b px-5 py-5 items-center">
                <h3 className="mb-4 font-serif text-3xl italic text-zinc-600">
                    {monthLabel} {currentYear}
                </h3>

                <div className="grid grid-cols-7 gap-4">
                    {calendarSlots.map((slot) => {
                        if (slot.day === null) {
                            return <div key={slot.key} className="size-4" />;
                        }

                        const hasEntry = entryDaySet.has(slot.day);

                        return (
                            <Tooltip key={slot.key}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`size-5 rounded-full cursor-default ${
                                            hasEntry
                                                ? "border-3 border-zinc-300 bg-zinc-600"
                                                : "bg-zinc-200"
                                        }`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    align="start"
                                    collisionPadding={8}
                                    className="font-sans text-sm"
                                >
                                    {monthLabel} {slot.day}
                                    {hasEntry ? " · journaled" : ""}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { HomeAside, type HomeAsideProps };
