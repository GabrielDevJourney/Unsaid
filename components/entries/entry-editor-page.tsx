"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
    const router = useRouter();
    const {
        loadExistingEntry,
        reset,
        entryId,
        isSaving,
        lastSavedAt,
        saveError,
    } = useEntryEditorStore();

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

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <PageHeader className="justify-between items-center">
                <div className="flex items-center pl-4 gap-4">
                    <button
                        type="button"
                        onClick={() => router.push("/home")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                    </button>
                    <h1 className="font-serif text-3xl italic text-zinc-600">
                        {formatEntryDate(date)}
                    </h1>
                </div>
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
            </PageHeader>

            {/* Content */}
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
