import { HomeEmptyState } from "@/components/home/empty-state";
import { EntryCard } from "@/components/home/entry-card";
import type { EntryWithInsight } from "@/types";

interface EntryItem {
    entry: EntryWithInsight;
}

interface EntryCardGridProps {
    entries: EntryItem[];
    totalEntries: number;
}

const EntryCardGrid = ({ entries, totalEntries }: EntryCardGridProps) => {
    if (totalEntries === 0) {
        return <HomeEmptyState />;
    }

    return (
        <div className="relative min-h-0 flex-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {entries.map((item, index) => (
                    <EntryCard
                        key={item.entry.id}
                        entry={item.entry}
                        entryNumber={totalEntries - index}
                    />
                ))}
            </div>

            {entries.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                    <p>No entries match your filters.</p>
                </div>
            )}
        </div>
    );
};

export { EntryCardGrid, type EntryCardGridProps, type EntryItem };
