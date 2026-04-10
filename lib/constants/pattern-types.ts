/**
 * Pattern types for weekly insights.
 * Used by AI to categorize patterns found across journal entries.
 *
 * Single source of truth - used in:
 * - Zod schemas (validation)
 * - Prompts (AI instructions)
 * - UI (display labels)
 */
export const PATTERN_TYPES = {
    recurring_theme: {
        code: "recurring_theme",
        label: "Recurring Theme",
        color: "border-[#b8e8c5] bg-[#f0faf3] text-[#2a7048]",
        description: "A topic or subject that appears across multiple entries",
        example: "Work-life balance, Family relationships",
    },
    emotional_trigger: {
        code: "emotional_trigger",
        label: "Emotional Trigger",
        color: "border-[#f5c0c8] bg-[#fdf0f2] text-[#a02838]",
        description: "Something that consistently causes an emotional response",
        example: "Criticism from authority figures triggers defensiveness",
    },
    behavioral_pattern: {
        code: "behavioral_pattern",
        label: "Behavioral Pattern",
        color: "border-[#c2d0f0] bg-[#f0f4fd] text-[#2d4a8f]",
        description: "A recurring way of behaving or acting",
        example: "Procrastination, Overcommitting to tasks",
    },
    blind_spot: {
        code: "blind_spot",
        label: "Blind Spot",
        color: "border-[#d8c8f5] bg-[#f5f0fd] text-[#6030a0]",
        description:
            "A pattern of behavior or thinking that the person is unaware of but is evident across entries",
        example:
            "Consistently avoiding conflict, Not recognizing own contributions to problems",
    },
    unmet_need: {
        code: "unmet_need",
        label: "Unmet Need",
        color: "border-[#f5d5b2] bg-[#fdf4ed] text-[#8f4a20]",
        description:
            "An underlying need that surfaces across entries, leading to patterns of behavior",
        example: "Need for connection, Need for recognition",
    },
    growth: {
        code: "growth",
        label: "Growth",
        color: "border-[#b0e8c8] bg-[#f0fdf5] text-[#206848]",
        description: "Evidence of positive change or progress",
        example: "Handling conflict better than last month",
    },
} as const;

/**
 * Array of pattern type codes for Zod enum
 */
export const PATTERN_TYPE_CODES = Object.keys(PATTERN_TYPES) as [
    keyof typeof PATTERN_TYPES,
    ...Array<keyof typeof PATTERN_TYPES>,
];

/**
 * Type for pattern type codes
 */
export type PatternTypeCode = keyof typeof PATTERN_TYPES;

/**
 * Badge styles derived from PATTERN_TYPES — single source of truth
 */
export const PATTERN_TYPE_BADGE_STYLES = Object.fromEntries(
    Object.entries(PATTERN_TYPES).map(([key, { color }]) => [key, color]),
) as Record<PatternTypeCode, string>;

/**
 * Generate prompt section for pattern types
 * Used to keep prompt in sync with code
 */
export const generatePatternTypesPromptSection = (): string => {
    const lines = Object.values(PATTERN_TYPES).map(
        (type) =>
            `- **${type.code}**: ${type.description}\n  Example: "${type.example}"`,
    );

    return `Pattern types (choose ONE primary type per pattern):\n\n${lines.join("\n\n")}`;
};
