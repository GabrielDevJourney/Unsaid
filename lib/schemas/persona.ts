import { z } from "zod";

// Short keys — stored in DB (enforced by CHECK constraints)
export const Q1_KEYS = [
    "never_tried",
    "drifted_away",
    "sometimes",
    "regular_habit",
] as const;

export const Q2_KEYS = [
    "steady",
    "bit_lost",
    "overwhelmed",
    "quietly_okay",
] as const;

export const Q3_KEYS = [
    "self_understanding",
    "processing",
    "pattern_awareness",
    "safe_space",
] as const;

export const Q4_KEYS = [
    "relationships",
    "work_projects",
    "identity_direction",
    "everything",
] as const;

// Display options — key + label pairs used by the question step UI
export const Q1_OPTIONS = [
    { key: "never_tried", label: "I've never really tried" },
    { key: "drifted_away", label: "I used to, but drifted away" },
    { key: "sometimes", label: "I do it sometimes" },
    { key: "regular_habit", label: "It's already a regular habit" },
] as const;

export const Q2_OPTIONS = [
    { key: "steady", label: "Steady" },
    { key: "bit_lost", label: "A bit lost" },
    { key: "overwhelmed", label: "Overwhelmed" },
    { key: "quietly_okay", label: "Quietly okay" },
] as const;

export const Q3_OPTIONS = [
    {
        key: "self_understanding",
        label: "To understand myself a little better",
    },
    {
        key: "processing",
        label: "To process things that are hard to say out loud",
    },
    {
        key: "pattern_awareness",
        label: "To notice the patterns shaping my life",
    },
    { key: "safe_space", label: "Just somewhere to put it all" },
] as const;

export const Q4_OPTIONS = [
    { key: "relationships", label: "The people in my life" },
    { key: "work_projects", label: "What I'm building or working on" },
    { key: "identity_direction", label: "Who I am and where I'm headed" },
    {
        key: "everything",
        label: "Everything at once — it's hard to separate",
    },
] as const;

// Label maps — convert stored keys to human-readable text for AI context
export const Q1_LABEL_MAP: Record<string, string> = Object.fromEntries(
    Q1_OPTIONS.map((o) => [o.key, o.label]),
);
export const Q2_LABEL_MAP: Record<string, string> = Object.fromEntries(
    Q2_OPTIONS.map((o) => [o.key, o.label]),
);
export const Q3_LABEL_MAP: Record<string, string> = Object.fromEntries(
    Q3_OPTIONS.map((o) => [o.key, o.label]),
);
export const Q4_LABEL_MAP: Record<string, string> = Object.fromEntries(
    Q4_OPTIONS.map((o) => [o.key, o.label]),
);

export const Q1_QUESTION = "How would you describe your journaling history?";
export const Q2_QUESTION =
    "How are you feeling right now, in this season of your life?";
export const Q3_QUESTION = "What are you hoping to find here?";
export const Q4_QUESTION =
    "When things get hard, what takes up most of your headspace?";

export const personaInputSchema = z.object({
    displayName: z.string().min(1).max(100),
    q1Answer: z.enum(Q1_KEYS),
    q2Answer: z.enum(Q2_KEYS),
    q3Answer: z.enum(Q3_KEYS),
    q4Answer: z.enum(Q4_KEYS),
});

export type PersonaInput = z.infer<typeof personaInputSchema>;
