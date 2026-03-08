import { getMonthName } from "@/lib/date-utils";
import { EntriesCalendar } from "./entries-calendar";

interface HomeAsideProps {
    totalEntries: number;
    totalPatternsCount: number;
    entryDates: string[];
}

const pad2 = (n: number): string =>
    new Intl.NumberFormat("en-US", { minimumIntegerDigits: 2 }).format(n);

const HomeAside = ({
    totalEntries,
    totalPatternsCount,
    entryDates,
}: HomeAsideProps) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLabel = getMonthName(currentYear, currentMonth);

    return (
        <div className="flex h-full flex-col w-full">
            {/* Date + Stats -- 2x2 grid, first row 2x height of second */}
            <div className="grid h-78 grid-cols-2 grid-rows-[6fr_3fr]">
                {/* Row 1, Col 1: empty */}
                <div className="border-b" />

                {/* Row 1, Col 2: day + month */}
                <div className="flex flex-col items-center justify-center border-b">
                    <div className="flex flex-col items-end">
                        <span className="font-serif text-[54px] leading-none text-zinc-600 italic text-center">
                            {pad2(now.getDate())}
                        </span>
                        <span className="text-xl text-gray-500 text-center w-full">
                            {monthLabel}
                        </span>
                    </div>
                </div>

                {/* Row 2, Col 1: written entries */}
                <div className="flex flex-col items-center justify-center text-zinc-600 border-r border-b">
                    <div className="flex flex-col justify-center">
                        <span className="font-serif text-2xl italic text-center">
                            {pad2(totalEntries)}
                        </span>
                        <span className="leading-tight text-muted-foreground text-center">
                            Written
                            <br />
                            entries
                        </span>
                    </div>
                </div>

                {/* Row 2, Col 2: patterns found */}
                <div className="flex flex-col items-center justify-center border-b text-zinc-600">
                    <div className="flex flex-col justify-center">
                        <span className="font-serif text-2xl italic text-center">
                            {pad2(totalPatternsCount)}
                        </span>
                        <span className="leading-tight text-muted-foreground text-center">
                            Patterns
                            <br />
                            found
                        </span>
                    </div>
                </div>
            </div>

            {/* Mini calendar */}
            <EntriesCalendar
                entryDates={entryDates}
                currentYear={currentYear}
                currentMonth={currentMonth}
                monthLabel={monthLabel}
            />
        </div>
    );
};

export { HomeAside, type HomeAsideProps };
