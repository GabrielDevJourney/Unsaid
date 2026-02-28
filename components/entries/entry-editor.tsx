"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
    MAX_ENTRY_LENGTH,
    MAX_WORD_COUNT,
    MIN_ENTRY_LENGTH,
} from "@/lib/constants";
import { useEntryEditorStore } from "@/lib/entry-editor/store";

const AUTOSAVE_DELAY_MS = 800;

const countWords = (text: string): number =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

export const EntryEditor = () => {
    const router = useRouter();
    const { content, setContent, saveNow, entryId } = useEntryEditorStore();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const wordCount = countWords(content);
    const isBelowMinLength =
        content.length > 0 && content.trim().length < MIN_ENTRY_LENGTH;

    useEffect(() => {
        if (content.trim().length < MIN_ENTRY_LENGTH) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const { isNew, entryId: savedId } = await saveNow();
            if (isNew && savedId) {
                router.replace(`/entries/${savedId}`);
            }
        }, AUTOSAVE_DELAY_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [content, saveNow, router]);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm">
            <textarea
                className="flex-1 resize-none p-12 text-base text-neutral-500 leading-relaxed bg-transparent outline-none placeholder:text-muted-foreground/50 font-serif"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_ENTRY_LENGTH + 100}
                // biome-ignore lint/a11y/noAutofocus: intentional for writing flow
                autoFocus={!entryId}
            />
            <div className="flex items-center justify-between px-6 py-4 text-xs text-muted-foreground">
                <span>{isBelowMinLength && "Keep writing to save..."}</span>
                <span>
                    {wordCount}/{MAX_WORD_COUNT} words
                </span>
            </div>
        </div>
    );
};
