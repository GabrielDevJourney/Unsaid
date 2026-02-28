import { create } from "zustand";
import { createEntryAction, saveEntryAction } from "@/app/actions/entries";
import type { EntryInsightSummary } from "@/types";
import { isServiceError } from "@/types";

interface EntryEditorState {
    entryId: string | null;
    content: string;
    savedContent: string;
    isSaving: boolean;
    saveError: string | null;
    lastSavedAt: Date | null;
    insight: EntryInsightSummary | null;
}

interface EntryEditorActions {
    setContent: (content: string) => void;
    loadExistingEntry: (
        entryId: string,
        content: string,
        insight: EntryInsightSummary | null,
    ) => void;
    setInsight: (insight: EntryInsightSummary) => void;
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
    insight: null,
};

export const useEntryEditorStore = create<
    EntryEditorState & EntryEditorActions
>()((set, get) => ({
    ...initialState,

    setContent: (content) => set({ content }),

    loadExistingEntry: (entryId, content, insight) => {
        const { entryId: currentEntryId } = get();
        if (currentEntryId === entryId) {
            set({ insight });
            return;
        }
        set({ entryId, content, savedContent: content, insight });
    },

    setInsight: (insight) => set({ insight }),

    saveNow: async () => {
        const { entryId, content, savedContent, isSaving } = get();

        if (isSaving || content === savedContent) {
            return { entryId, isNew: false };
        }

        set({ isSaving: true, saveError: null });

        try {
            if (!entryId) {
                const result = await createEntryAction(content);
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

            const result = await saveEntryAction(entryId, content);
            if (isServiceError(result)) {
                set({ isSaving: false, saveError: result.error });
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
