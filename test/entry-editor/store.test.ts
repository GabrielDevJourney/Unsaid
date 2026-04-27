import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEntryEditorStore } from "@/lib/entry-editor/store";

describe("useEntryEditorStore", () => {
    beforeEach(() => {
        useEntryEditorStore.getState().reset();
        vi.restoreAllMocks();
    });

    it("handles malformed success JSON without accepting the save", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: {} }),
                }),
            ),
        );

        useEntryEditorStore.setState({
            content: "A new entry with enough content.",
            savedContent: "",
            entryId: null,
        });

        const result = await useEntryEditorStore.getState().saveNow();

        expect(result).toEqual({ entryId: null, isNew: false });
        expect(useEntryEditorStore.getState().saveError).toBe("Failed to save");
    });
});
