/**
 * Insight tag types for entry-level AI classification.
 * Single source of truth used in:
 * - Zod schemas (AI output validation)
 * - entry-tag.tsx (display styles)
 * - DB storage (entry_insights.tags)
 */
export const INSIGHT_TAG_TYPES = [
    "Relationships",
    "Work",
    "Family",
    "Health",
    "Identity",
    "Goals",
    "Anxiety",
    "Boundaries",
    "Self-Worth",
    "Money",
    "Habits",
    "Creativity",
    "Loss",
    "Growth",
    "Conflict",
    "Purpose",
    "Loneliness",
    "Stress",
    "Change",
    "Decision",
    "Vulnerability",
] as const;

export type InsightTagType = (typeof INSIGHT_TAG_TYPES)[number];
