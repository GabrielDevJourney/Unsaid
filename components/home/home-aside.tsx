import { HomeAsideIcon } from "../icons/home-aside-icon";

// Days in January 2026 that have journal entries (matches mock data)
const MOCK_ENTRY_DAYS = new Set([23, 25, 27, 28, 29, 31]);

const MOCK_DATE = {
    day: 24,
    month: "January",
    year: 2026,
};

const MOCK_STATS = {
    writtenEntries: 24,
    weeklyInsights: 4,
};

// January 2026 starts on Thursday (index 3 in Mon-start week)
const buildCalendarGrid = () => {
    const daysInMonth = 31;
    // 0=Mon, 1=Tue, ..., 6=Sun — January 1, 2026 is Thursday (index 3)
    const startDayOffset = 3;

    const grid: (number | null)[][] = [];
    let currentDay = 1;

    // First row with leading empty cells
    const firstRow: (number | null)[] = Array.from<null>({
        length: startDayOffset,
    }).fill(null);
    while (firstRow.length < 7 && currentDay <= daysInMonth) {
        firstRow.push(currentDay++);
    }
    grid.push(firstRow);

    // Remaining full/partial rows
    while (currentDay <= daysInMonth) {
        const row: (number | null)[] = [];
        for (let i = 0; i < 7 && currentDay <= daysInMonth; i++) {
            row.push(currentDay++);
        }
        while (row.length < 7) {
            row.push(null);
        }
        grid.push(row);
    }

    return grid;
};

// Flat list of calendar slots with stable keys for rendering
const calendarSlots = buildCalendarGrid().flatMap((row, rowIndex) =>
    row.map((day, colIndex) => ({
        key: day !== null ? `day-${day}` : `empty-${rowIndex}-${colIndex}`,
        day,
    })),
);

const HomeAside = () => {
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
                                {MOCK_DATE.day}
                            </span>
                        </div>

                        <span className="text-xl text-gray-500">
                            {MOCK_DATE.month}
                        </span>
                    </div>
                </div>

                {/* Row 2, Col 1: written entries */}
                <div className="flex flex-col items-center justify-center text-zinc-600 border-r border-b">
                    <div className="flex flex-col justify-start">
                        <span className="font-serif text-2xl italic">
                            {MOCK_STATS.writtenEntries}
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
                            {MOCK_STATS.weeklyInsights}
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
                    {MOCK_DATE.month} {MOCK_DATE.year}
                </h3>

                <div className="grid grid-cols-7 gap-4">
                    {calendarSlots.map((slot) => {
                        if (slot.day === null) {
                            return <div key={slot.key} className="size-4" />;
                        }

                        const hasEntry = MOCK_ENTRY_DAYS.has(slot.day);

                        return (
                            <div
                                key={slot.key}
                                className={`size-5 rounded-full ${
                                    hasEntry
                                        ? "border-3 border-zinc-300 bg-zinc-600"
                                        : "bg-zinc-200"
                                }`}
                                title={`${MOCK_DATE.month} ${slot.day}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { HomeAside };
