import { create } from "zustand";

interface SidebarBadgeStore {
    progressAdjustment: number;
    decrementProgress: () => void;
}

export const useSidebarBadgeStore = create<SidebarBadgeStore>((set) => ({
    progressAdjustment: 0,
    decrementProgress: () =>
        set((s) => ({ progressAdjustment: s.progressAdjustment + 1 })),
}));
