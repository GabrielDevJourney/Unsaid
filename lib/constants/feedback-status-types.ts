/**
 * Feedback status display config.
 * Single source of truth used in:
 * - feedback-card.tsx (status badge)
 * - Any future admin or analytics UI
 *
 * Color pattern mirrors pattern-types.ts: border-{color}-300 bg-{color}-100 text-{color}-500
 */
export const FEEDBACK_STATUS_CONFIG = {
    in_progress: {
        label: "In Progress",
        color: "border-yellow-300 bg-yellow-100 text-yellow-800",
    },
    completed: {
        label: "Completed",
        color: "border-cyan-200 bg-cyan-100 text-cyan-800",
    },
    wont_do: {
        label: "Won't Do",
        color: "border-red-300 bg-red-100 text-red-800",
    },
    rejected: {
        label: "Rejected",
        color: "border-zinc-300 bg-zinc-100 text-zinc-800",
    },
} as const;
