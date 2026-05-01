"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { savePromptAction } from "@/app/actions/prompts";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import { cn, formatEntryDate } from "@/lib/utils";
import type { EntryInsightSummary } from "@/types";
import { PageHeader } from "../layout/page-header";
import { EntryEditor } from "./entry-editor";

interface InitialEntry {
    id: string;
    content: string;
    insights: EntryInsightSummary[];
    createdAt: string;
}

interface EntryEditorPageProps {
    initialEntry?: InitialEntry;
    initialSuggestion?: string | null;
    reflectionContext?: string | null;
    sourceType?: string | null;
    sourceId?: string | null;
}

const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const EntryEditorPage = ({
    initialEntry,
    initialSuggestion,
    reflectionContext,
    sourceType,
    sourceId,
}: EntryEditorPageProps) => {
    const searchParams = useSearchParams();
    const {
        loadExistingEntry,
        reset,
        entryId,
        isSaving,
        lastSavedAt,
        saveError,
        suggestion,
        isLoadingSuggestion,
        setSuggestion,
        setIsLoadingSuggestion,
        setReflectionContext,
        setSource,
    } = useEntryEditorStore();
    const storeEntryId = useEntryEditorStore((s) => s.entryId);
    const [, setTick] = useState(0);

    const isNewEntry = useRef(initialEntry === undefined);
    const initialEntryId = useRef(initialEntry?.id ?? null);
    const hasSavedPrompt = useRef(false);
    const isDismissed = useRef(false);
    const _hasInitialSuggestion = useRef(!!initialSuggestion);

    useLayoutEffect(() => {
        if (initialEntry) {
            loadExistingEntry(
                initialEntry.id,
                initialEntry.content,
                initialEntry.insights,
            );
        } else {
            reset();
            if (initialSuggestion) {
                setSuggestion(initialSuggestion);
                setIsLoadingSuggestion(false);
            }
            if (reflectionContext) {
                setReflectionContext(reflectionContext);
            }
            if (sourceType && sourceId) {
                setSource(sourceType, sourceId);
            }
        }
    }, [
        loadExistingEntry,
        initialEntry,
        reset,
        initialSuggestion,
        reflectionContext,
        sourceType,
        sourceId,
        setSuggestion,
        setIsLoadingSuggestion,
        setReflectionContext,
        setSource,
    ]);

    // Fetch suggestion for new entries.
    useEffect(() => {
        if (!isNewEntry.current) return;
        if (suggestion !== null || _hasInitialSuggestion.current) return;

        fetch("/api/prompts/entry-theme")
            .then((res) => res.json())
            .then((json) => setSuggestion(json.data.promptText))
            .catch(() =>
                setSuggestion(
                    "What's been on your mind lately that you haven't said out loud?",
                ),
            )
            .finally(() => setIsLoadingSuggestion(false));
    }, [setIsLoadingSuggestion, setSuggestion, suggestion]);

    // Fetch the saved prompt for existing entries.
    useEffect(() => {
        if (isNewEntry.current || !initialEntryId.current) return;

        setIsLoadingSuggestion(true);
        fetch(`/api/prompts/entry/${initialEntryId.current}`)
            .then((res) => res.json())
            .then((json) => setSuggestion(json.data?.promptText ?? null))
            .catch(() => setSuggestion(null))
            .finally(() => setIsLoadingSuggestion(false));
    }, [setIsLoadingSuggestion, setSuggestion]);

    // Save prompt when autosave first creates the entry
    useEffect(() => {
        if (
            !storeEntryId ||
            !suggestion ||
            hasSavedPrompt.current ||
            !isNewEntry.current ||
            isDismissed.current
        )
            return;

        void savePromptAction(suggestion, storeEntryId).then((result) => {
            if ("error" in result) {
                console.error("Failed to persist prompt:", result.error);
                return;
            }

            hasSavedPrompt.current = true;
        });
    }, [storeEntryId, suggestion]);

    useEffect(() => {
        if (!lastSavedAt) return;
        const interval = setInterval(() => setTick((t) => t + 1), 30_000);
        return () => clearInterval(interval);
    }, [lastSavedAt]);

    const date = initialEntry?.createdAt
        ? new Date(initialEntry.createdAt)
        : new Date();

    const saveStatus = saveError
        ? "Failed to save"
        : isSaving
          ? "Saving..."
          : lastSavedAt
            ? `Saved ${formatRelativeTime(lastSavedAt)}`
            : entryId || initialEntry?.id
              ? "Saved"
              : "";

    const resolvedEntryId = initialEntry?.id ?? entryId ?? null;
    // Capture on mount — URL is later replaced to /entries/[id] which strips query params
    const backHref = useRef(searchParams.get("from") ?? "/home").current;

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <PageHeader backHref={backHref}>
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="font-serif text-3xl italic text-zinc-600">
                        {formatEntryDate(date)}
                    </h1>
                    <div className="flex items-center gap-3 pr-4">
                        <span
                            className={cn(
                                "text-sm",
                                saveError
                                    ? "text-destructive"
                                    : "text-muted-foreground",
                            )}
                        >
                            {saveStatus}
                        </span>
                    </div>
                </div>
            </PageHeader>

            <div className="flex flex-1 items-start justify-center overflow-hidden p-6">
                <div className="h-full w-[70%]">
                    <EntryEditor
                        entryId={resolvedEntryId}
                        suggestion={suggestion}
                        isLoadingSuggestion={isLoadingSuggestion}
                        isNewEntry={isNewEntry.current}
                        onDismiss={() => {
                            isDismissed.current = true;
                        }}
                        initialContent={initialEntry?.content}
                        initialInsights={initialEntry?.insights ?? []}
                        isContextualEntry={_hasInitialSuggestion.current}
                    />
                </div>
            </div>
        </div>
    );
};
