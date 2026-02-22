"use client";

import { InsightDisplay } from "./insight-display";
import { JournalingSuggestion } from "./journaling-suggestion";

interface EntryInsightPanelProps {
    entryId: string | null;
}

export const EntryInsightPanel = ({ entryId }: EntryInsightPanelProps) => {
    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto pl-2">
            <JournalingSuggestion />
            <InsightDisplay entryId={entryId} />
        </div>
    );
};
