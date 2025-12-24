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
    theme: {
        code: "theme",
        label: "Theme",
        description: "A topic or subject that appears across multiple entries",
        example: "Work-life balance, Family relationships",
    },
    trigger: {
        code: "trigger",
        label: "Trigger",
        description: "Something that consistently causes an emotional response",
        example: "Criticism from authority figures triggers defensiveness",
    },
    thought_pattern: {
        code: "thought_pattern",
        label: "Thought Pattern",
        description: "A recurring way of thinking or interpreting events",
        example: "Assuming the worst outcome, All-or-nothing thinking",
    },
    avoidance: {
        code: "avoidance",
        label: "Avoidance",
        description: "Something you consistently avoid or postpone",
        example:
            "Avoiding difficult conversations, Postponing health decisions",
    },
    habit: {
        code: "habit",
        label: "Habit",
        description: "A repeated behavior, positive or negative",
        example: "Late-night overthinking, Sunday meal prep",
    },
    need: {
        code: "need",
        label: "Need",
        description: "An underlying need that surfaces across entries",
        example: "Need for validation, Need for autonomy",
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
