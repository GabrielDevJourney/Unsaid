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
        description: "A topic or subject that appears across multiple entries",
        example: "Work-life balance, Family relationships",
    },
    emotional_trigger: {
        code: "emotional_trigger",
        label: "Emotional Trigger",
        description: "Something that consistently causes an emotional response",
        example: "Criticism from authority figures triggers defensiveness",
    },
    behavioral_pattern: {
        code: "behavioral_pattern",
        label: "Behavioral Pattern",
        description: "A recurring way of behaving or acting",
        example: "Procrastination, Overcommitting to tasks",
    },
    blind_spot: {
        code: "blind_spot",
        label: "Blind Spot",
        description:
            "A pattern of behavior or thinking that the person is unaware of but is evident across entries",
        example:
            "Consistently avoiding conflict, Not recognizing own contributions to problems",
    },
    unmet_need: {
        code: "unmet_need",
        label: "Unmet Need",
        description:
            "An underlying need that surfaces across entries, leading to patterns of behavior",
        example: "Need for connection, Need for recognition",
    },
    growth: {
        code: "growth",
        label: "Growth",
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
