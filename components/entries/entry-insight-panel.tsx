"use client";

import { useEffect, useRef, useState } from "react";
import { savePromptAction } from "@/app/actions/prompts";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import { InsightDisplay } from "./insight-display";
import { JournalingSuggestion } from "./journaling-suggestion";

interface EntryInsightPanelProps {
    entryId: string | null;
}

export const EntryInsightPanel = ({ entryId }: EntryInsightPanelProps) => {
    const isNewEntry = useRef(entryId === null);
    const initialEntryId = useRef(entryId);
    const hasSavedPrompt = useRef(false);

    const storeEntryId = useEntryEditorStore((s) => s.entryId);

    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: generate for new entries, load for existing ones
    useEffect(() => {
        if (isNewEntry.current) {
            fetch("/api/prompts/entry-theme")
                .then((res) => res.json())
                .then((json) => setSuggestion(json.data.promptText))
                .catch(() =>
                    setSuggestion(
                        "What's been on your mind lately that you haven't said out loud?",
                    ),
                )
                .finally(() => setIsLoading(false));
        } else if (initialEntryId.current) {
            fetch(`/api/prompts/entry/${initialEntryId.current}`)
                .then((res) => res.json())
                .then((json) => setSuggestion(json.data?.promptText ?? null))
                .catch(() => setSuggestion(null))
                .finally(() => setIsLoading(false));
        }
    }, []);

    // When autosave first creates the entry, persist the prompt
    useEffect(() => {
        if (
            !storeEntryId ||
            !suggestion ||
            hasSavedPrompt.current ||
            !isNewEntry.current
        )
            return;

        hasSavedPrompt.current = true;
        savePromptAction(suggestion, storeEntryId);
    }, [storeEntryId, suggestion]);

    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto pl-2">
            <JournalingSuggestion
                suggestion={suggestion}
                isLoading={isLoading}
            />
            <InsightDisplay entryId={entryId} />
        </div>
    );
};
