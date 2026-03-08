import { getMonthName } from "@/lib/date-utils";
import { HomeAsideIcon } from "../icons/home-aside-icon";
import { EntriesCalendar } from "./entries-calendar";

interface HomeAsideProps {
    totalEntries: number;
    totalPatternsCount: number;
    entryDates: string[];
}

const HomeAside = ({
    totalEntries,
    totalPatternsCount,
    entryDates,
}: HomeAsideProps) => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLabel = getMonthName(currentYear, currentMonth);

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
                            {totalPatternsCount}
                        </span>
                        <span className="text-xs leading-tight text-muted-foreground">
                            patterns
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
