import type { PersonaRow } from "@/lib/persona/repo";
import {
    Q1_LABEL_MAP,
    Q2_LABEL_MAP,
    Q3_LABEL_MAP,
    Q4_LABEL_MAP,
} from "@/lib/schemas/persona";

export const buildPersonaContext = (persona: PersonaRow | null): string => {
    if (!persona) return "";

    if (persona.summary) {
        return `User: ${persona.displayName}\n\n${persona.summary}`;
    }

    return `User: ${persona.displayName}
Journaling history: ${Q1_LABEL_MAP[persona.q1Answer] ?? persona.q1Answer}
Current season: ${Q2_LABEL_MAP[persona.q2Answer] ?? persona.q2Answer}
Looking for: ${Q3_LABEL_MAP[persona.q3Answer] ?? persona.q3Answer}
When things get hard: ${Q4_LABEL_MAP[persona.q4Answer] ?? persona.q4Answer}`;
};
