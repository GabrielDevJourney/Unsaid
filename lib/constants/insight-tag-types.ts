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

/**
 * Display styles for each insight tag.
 * Thematic pastel system — bg/border/text in custom hex.
 * Pattern: very light bg, mid-tone border, dark readable text.
 * Colocated here so the constant is the single source of truth for both
 * type and presentation.
 */
export const INSIGHT_TAG_STYLES: Record<InsightTagType, string> = {
    Relationships: "border-[#f5c6d8] bg-[#fdf0f5] text-[#a03060]",
    Work: "border-[#c2d0f0] bg-[#f0f4fd] text-[#2d4a8f]",
    Family: "border-[#f5d5b2] bg-[#fdf4ed] text-[#8f4a20]",
    Health: "border-[#b8e8c5] bg-[#f0faf3] text-[#2a7048]",
    Identity: "border-[#d8c8f5] bg-[#f5f0fd] text-[#6030a0]",
    Goals: "border-[#b8d8f0] bg-[#f0f7fd] text-[#2060a0]",
    Anxiety: "border-[#f0e2a0] bg-[#fdf9e8] text-[#7a6010]",
    Boundaries: "border-[#c8c8f5] bg-[#f0f0fd] text-[#3030a0]",
    "Self-Worth": "border-[#d0f0b8] bg-[#f5fdf0] text-[#506020]",
    Money: "border-[#b0e8d5] bg-[#f0fdf8] text-[#206050]",
    Habits: "border-[#a8e8e0] bg-[#f0fdfb] text-[#186058]",
    Creativity: "border-[#a8e8f5] bg-[#f0fdff] text-[#186078]",
    Loss: "border-[#ccd0dc] bg-[#f4f5f8] text-[#404860]",
    Growth: "border-[#f0c888] bg-[#fdf6e8] text-[#804010]",
    Conflict: "border-[#f5c0a8] bg-[#fdf3f0] text-[#8f3020]",
    Purpose: "border-[#d0c0f5] bg-[#f3f0fd] text-[#5830a8]",
    Loneliness: "border-[#c0d4dc] bg-[#f2f6f8] text-[#305060]",
    Stress: "border-[#f5c0c8] bg-[#fdf0f2] text-[#a02838]",
    Change: "border-[#f0dcc8] bg-[#fdf6f0] text-[#7a5030]",
    Decision: "border-[#d0d4e0] bg-[#f3f4f8] text-[#3a4060]",
    Vulnerability: "border-[#f0c8e8] bg-[#fdf0fb] text-[#8a3070]",
};
