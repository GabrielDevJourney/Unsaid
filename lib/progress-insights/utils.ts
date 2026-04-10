import { PROGRESS_TRIGGER_INTERVAL } from "@/lib/constants";

interface ProgressCycleInput {
    totalEntries: number;
    entryCountAtLastProgress: number;
}

interface ProgressCycleResult {
    entriesInCycle: number;
    fillPct: number;
    nextIn: number;
}

export const computeProgressCycle = ({
    totalEntries,
    entryCountAtLastProgress,
}: ProgressCycleInput): ProgressCycleResult => {
    const entriesInCycle = Math.max(0, totalEntries - entryCountAtLastProgress);
    const fillPct = Math.min(
        100,
        (entriesInCycle / PROGRESS_TRIGGER_INTERVAL) * 100,
    );
    const nextIn = Math.max(0, PROGRESS_TRIGGER_INTERVAL - entriesInCycle);
    return { entriesInCycle, fillPct, nextIn };
};
