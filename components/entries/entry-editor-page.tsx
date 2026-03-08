"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import { cn, formatEntryDate } from "@/lib/utils";
import type { EntryInsightSummary } from "@/types";
import { PageHeader } from "../layout/page-header";
import { EntryEditor } from "./entry-editor";
import { EntryInsightPanel } from "./entry-insight-panel";

interface InitialEntry {
    id: string;
    content: string;
    insight: EntryInsightSummary | null;
    createdAt: string;
}

interface EntryEditorPageProps {
    initialEntry?: InitialEntry;
}

const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const EntryEditorPage = ({ initialEntry }: EntryEditorPageProps) => {
    const searchParams = useSearchParams();
    const {
        loadExistingEntry,
        reset,
        entryId,
        isSaving,
        lastSavedAt,
        saveError,
    } = useEntryEditorStore();
    const [, setTick] = useState(0);

    useEffect(() => {
        if (initialEntry) {
            loadExistingEntry(
                initialEntry.id,
                initialEntry.content,
                initialEntry.insight,
            );
        } else {
            reset();
        }
    }, [loadExistingEntry, initialEntry, reset]);

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
    const backHref = searchParams.get("from") ?? "/home";

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

            <div className="flex flex-1 gap-4 overflow-hidden p-6">
                <div className="min-w-0 flex-1">
                    <EntryEditor />
                </div>
                <div className="w-108 shrink-0">
                    <EntryInsightPanel entryId={resolvedEntryId} />
                </div>
            </div>
        </div>
    );
};
