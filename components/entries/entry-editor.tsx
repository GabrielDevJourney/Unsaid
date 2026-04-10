"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    MAX_ENTRY_LENGTH,
    MAX_INSIGHT_COUNT,
    MAX_WORD_COUNT,
    MIN_ENTRY_LENGTH,
} from "@/lib/constants";
import { useEntryEditorStore } from "@/lib/entry-editor/store";
import type { EntryInsightSummary } from "@/types";
import type { InsightDisplayHandle } from "./insight-display";
import { InsightBlockquote, InsightDisplay } from "./insight-display";
import { JournalingSuggestion } from "./journaling-suggestion";

const AUTOSAVE_DELAY_MS = 800;

const countWords = (text: string): number =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

interface TextSegment {
    id: string;
    text: string;
    completedInsight: string | null;
}

// SegmentTextarea: auto-resizes to content, isolated ref per segment
interface SegmentTextareaProps {
    value: string;
    onChange: (text: string) => void;
    autoFocus?: boolean;
    isFirst: boolean;
}

const SegmentTextarea = ({
    value,
    onChange,
    autoFocus,
    isFirst,
}: SegmentTextareaProps) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    // Place cursor at end on initial mount (first segment only)
    useEffect(() => {
        if (!isFirst || !ref.current) return;
        const el = ref.current;
        el.setSelectionRange(el.value.length, el.value.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFirst]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: value change drives scrollHeight
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none bg-transparent px-12 pt-6 pb-2 text-base leading-relaxed text-neutral-500 outline-none placeholder:text-muted-foreground/50 font-serif"
            placeholder={
                isFirst ? "What's on your mind?" : "Continue writing..."
            }
            maxLength={MAX_ENTRY_LENGTH + 100}
            // biome-ignore lint/a11y/noAutofocus: intentional for writing flow
            autoFocus={autoFocus}
        />
    );
};

/**
 * Reconstruct TextSegment[] from persisted insights on page load.
 * If all insights have contentBeforeLength, split content at each position.
 * Falls back to all-content-then-last-insight for old entries without split info.
 */
const buildInitialSegments = (
    content: string,
    insights: EntryInsightSummary[],
): TextSegment[] => {
    if (insights.length === 0) {
        return [
            { id: crypto.randomUUID(), text: content, completedInsight: null },
        ];
    }

    const sorted = [...insights].sort(
        (a, b) => a.generationOrder - b.generationOrder,
    );
    const allHaveSplit = sorted.every((i) => i.contentBeforeLength != null);

    if (allHaveSplit) {
        let prevEnd = 0;
        const segs: TextSegment[] = [];
        for (const ins of sorted) {
            const splitAt = ins.contentBeforeLength ?? 0;
            const raw = content.slice(prevEnd, splitAt);
            const text = prevEnd === 0 ? raw : raw.replace(/^\n+/, "");
            segs.push({
                id: crypto.randomUUID(),
                text,
                completedInsight: ins.content,
            });
            prevEnd = splitAt;
        }
        const remaining = content.slice(prevEnd).replace(/^\n+/, "");
        segs.push({
            id: crypto.randomUUID(),
            text: remaining,
            completedInsight: null,
        });
        return segs;
    }

    // Fallback: old entry — all content in first segment, latest insight appended
    return [
        {
            id: crypto.randomUUID(),
            text: content,
            completedInsight: sorted.at(-1)?.content ?? null,
        },
        { id: crypto.randomUUID(), text: "", completedInsight: null },
    ];
};

interface EntryEditorProps {
    entryId: string | null;
    suggestion: string | null;
    isLoadingSuggestion: boolean;
    isNewEntry: boolean;
    onDismiss: () => void;
    initialContent?: string;
    initialInsights?: EntryInsightSummary[];
    isContextualEntry?: boolean;
}

export const EntryEditor = ({
    entryId,
    suggestion,
    isLoadingSuggestion,
    isNewEntry,
    onDismiss,
    initialContent,
    initialInsights,
    isContextualEntry,
}: EntryEditorProps) => {
    const { setContent, saveNow, insights, isGeneratingInsight } =
        useEntryEditorStore();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const insightRef = useRef<InsightDisplayHandle>(null);

    // Segments are the source of truth for what's displayed and saved
    const [segments, setSegments] = useState<TextSegment[]>(() => {
        if (initialContent !== undefined && initialContent !== "") {
            return buildInitialSegments(initialContent, initialInsights ?? []);
        }
        return [{ id: crypto.randomUUID(), text: "", completedInsight: null }];
    });

    const combinedContent = segments
        .map((s) => s.text)
        .filter((t) => t.trim() !== "")
        .join("\n\n");

    // Sync segments → store content for saving
    // biome-ignore lint/correctness/useExhaustiveDependencies: segments change drives content sync
    useEffect(() => {
        setContent(combinedContent);
    }, [segments]);

    const handleSegmentChange = useCallback((id: string, text: string) => {
        setSegments((prev) =>
            prev.map((s) => (s.id === id ? { ...s, text } : s)),
        );
    }, []);

    // Called when InsightDisplay finishes streaming a new insight
    const handleInsightComplete = useCallback((insightContent: string) => {
        setSegments((prev) => {
            const lastIdx = prev.length - 1;
            return [
                ...prev.slice(0, lastIdx),
                { ...prev[lastIdx], completedInsight: insightContent },
                { id: crypto.randomUUID(), text: "", completedInsight: null },
            ];
        });
    }, []);

    // Debounced autosave
    useEffect(() => {
        if (combinedContent.trim().length < MIN_ENTRY_LENGTH) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const { isNew, entryId: savedId } = await saveNow();
            if (isNew && savedId) {
                window.history.replaceState(null, "", `/entries/${savedId}`);
            }
        }, AUTOSAVE_DELAY_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [combinedContent, saveNow]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const {
                entryId: id,
                content: latest,
                savedContent,
            } = useEntryEditorStore.getState();
            if (
                !id ||
                latest === savedContent ||
                latest.trim().length < MIN_ENTRY_LENGTH
            )
                return;
            fetch(`/api/entries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: latest }),
                keepalive: true,
            });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    const wordCount = countWords(combinedContent);
    const isBelowMinLength =
        combinedContent.length > 0 &&
        combinedContent.trim().length < MIN_ENTRY_LENGTH;
    const insightCount = insights.length;
    const isAtLimit = insightCount >= MAX_INSIGHT_COUNT;
    const canGenerateInsight =
        !!entryId &&
        combinedContent.trim().length > 0 &&
        !isGeneratingInsight &&
        !isAtLimit;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm">
            {/* Scrollable writing area: suggestion + segments interleaved with insight blockquotes */}
            <div className="flex-1 overflow-y-auto pt-6">
                <JournalingSuggestion
                    suggestion={suggestion}
                    isLoading={isLoadingSuggestion}
                    isNewEntry={isNewEntry}
                    hasContent={combinedContent.trim().length > 0}
                    onDismiss={onDismiss}
                    autoActivate={isContextualEntry}
                />
                {segments.map((seg, idx) => (
                    <div key={seg.id}>
                        <SegmentTextarea
                            value={seg.text}
                            onChange={(text) =>
                                handleSegmentChange(seg.id, text)
                            }
                            isFirst={idx === 0}
                            autoFocus={idx === segments.length - 1 && idx > 0}
                        />
                        {seg.completedInsight && (
                            <InsightBlockquote content={seg.completedInsight} />
                        )}
                    </div>
                ))}

                {/* Streaming insight — visible only while generating */}
                <InsightDisplay
                    ref={insightRef}
                    entryId={entryId}
                    onInsightComplete={handleInsightComplete}
                />
            </div>

            <div className="flex items-center justify-between px-6 py-4 text-xs text-muted-foreground">
                <span>
                    {wordCount}/{MAX_WORD_COUNT} words
                </span>
                <div className="flex items-center gap-2">
                    {isBelowMinLength && <span>Keep writing to save...</span>}
                    {!isAtLimit && (
                        <Button
                            variant="sunrise-sm"
                            size="sm"
                            disabled={!canGenerateInsight}
                            onClick={() => insightRef.current?.generate()}
                        >
                            {isGeneratingInsight
                                ? "Reflecting..."
                                : "New insight"}
                            {insightCount > 0 && !isGeneratingInsight && (
                                <span className="ml-1.5 rounded-sm bg-black/20 px-1.5 py-0.5 text-[10px] leading-none">
                                    {insightCount}/{MAX_INSIGHT_COUNT}
                                </span>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
