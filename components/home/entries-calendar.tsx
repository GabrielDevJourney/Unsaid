import { JournalDot } from "../ui/journal-dot";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface EntriesCalendarProps {
    entryDates: string[];
    currentYear: number;
    currentMonth: number;
    monthLabel: string;
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

const EntriesCalendar = ({
    entryDates,
    currentMonth,
    currentYear,
    monthLabel,
}: EntriesCalendarProps) => {
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
                                {hasEntry ? (
                                    <JournalDot />
                                ) : (
                                    <div className="size-5 rounded-full bg-zinc-200" />
                                )}
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
    );
};

export { EntriesCalendar };
