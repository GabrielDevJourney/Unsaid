import { create } from "zustand";
import { createEntryAction } from "@/app/actions/entries";
import type { EntryInsightSummary } from "@/types";
import { isServiceError } from "@/types";

interface EntryEditorState {
    entryId: string | null;
    content: string;
    savedContent: string;
    isSaving: boolean;
    saveError: string | null;
    lastSavedAt: Date | null;
    insights: EntryInsightSummary[];
    isGeneratingInsight: boolean;
    suggestion: string | null;
    isLoadingSuggestion: boolean;
    reflectionContext: string | null;
    sourceType: string | null;
    sourceId: string | null;
}

interface EntryEditorActions {
    setContent: (content: string) => void;
    loadExistingEntry: (
        entryId: string,
        content: string,
        insights: EntryInsightSummary[],
    ) => void;
    addInsight: (insight: EntryInsightSummary) => void;
    setIsGeneratingInsight: (v: boolean) => void;
    setSuggestion: (v: string | null) => void;
    setIsLoadingSuggestion: (v: boolean) => void;
    setReflectionContext: (ctx: string | null) => void;
    setSource: (sourceType: string | null, sourceId: string | null) => void;
    saveNow: () => Promise<{ entryId: string | null; isNew: boolean }>;
    reset: () => void;
}

const initialState: EntryEditorState = {
    entryId: null,
    content: "",
    savedContent: "",
    isSaving: false,
    saveError: null,
    lastSavedAt: null,
    insights: [],
    isGeneratingInsight: false,
    suggestion: null,
    isLoadingSuggestion: true,
    reflectionContext: null,
    sourceType: null,
    sourceId: null,
};

export const useEntryEditorStore = create<
    EntryEditorState & EntryEditorActions
>()((set, get) => ({
    ...initialState,

    setContent: (content) => set({ content }),

    loadExistingEntry: (entryId, content, insights) => {
        const { entryId: currentEntryId } = get();
        if (currentEntryId === entryId) {
            set({ insights });
            return;
        }
        // Different entry — clear suggestion so it gets re-fetched
        set({
            entryId,
            content,
            savedContent: content,
            insights,
            suggestion: null,
            isLoadingSuggestion: false,
        });
    },

    addInsight: (insight) =>
        set((state) => ({ insights: [...state.insights, insight] })),

    setIsGeneratingInsight: (v) => set({ isGeneratingInsight: v }),

    setSuggestion: (v) => set({ suggestion: v }),

    setIsLoadingSuggestion: (v) => set({ isLoadingSuggestion: v }),

    setReflectionContext: (ctx) => set({ reflectionContext: ctx }),

    setSource: (sourceType, sourceId) => set({ sourceType, sourceId }),

    saveNow: async () => {
        const {
            entryId,
            content,
            savedContent,
            isSaving,
            sourceType,
            sourceId,
        } = get();

        if (isSaving || content === savedContent) {
            return { entryId, isNew: false };
        }

        set({ isSaving: true, saveError: null });

        try {
            if (!entryId) {
                const result = await createEntryAction(
                    content,
                    sourceType,
                    sourceId,
                );
                if (isServiceError(result)) {
                    set({ isSaving: false, saveError: result.error });
                    return { entryId: null, isNew: false };
                }
                const newId = result.data.id;
                set({
                    entryId: newId,
                    savedContent: content,
                    isSaving: false,
                    lastSavedAt: new Date(),
                });
                return { entryId: newId, isNew: true };
            }

            const res = await fetch(`/api/entries/${entryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (!res.ok) {
                const json = (await res.json()) as { error?: string };
                set({
                    isSaving: false,
                    saveError: json.error ?? "Failed to save",
                });
                return { entryId, isNew: false };
            }
            set({
                savedContent: content,
                isSaving: false,
                lastSavedAt: new Date(),
            });
            return { entryId, isNew: false };
        } catch {
            set({ isSaving: false, saveError: "Failed to save" });
            return { entryId, isNew: false };
        }
    },

    reset: () => set(initialState),
}));
