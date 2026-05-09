import type { SupabaseClient } from "@supabase/supabase-js";
import { generateInitialPersonaSummary } from "@/lib/ai/generate-persona-summary";
import { findEntryWithInsightById } from "@/lib/entries/repo";
import { findFirstEntryInsight } from "@/lib/entry-insights/repo";
import type { PersonaInput } from "@/lib/schemas/persona";
import {
    Q1_LABEL_MAP,
    Q2_LABEL_MAP,
    Q3_LABEL_MAP,
    Q4_LABEL_MAP,
} from "@/lib/schemas/persona";
import type { ServiceResult } from "@/types";
import {
    findPersona,
    type PersonaRow,
    updatePersonaSummary,
    upsertPersona,
} from "./repo";

export type { PersonaRow };

export const getPersona = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<PersonaRow | null>> => {
    const { data, error } = await findPersona(supabase, userId);
    if (error) {
        console.error(
            "Failed to fetch persona:",
            error instanceof Error ? error.message : String(error),
        );
        return { error: "Failed to fetch persona" };
    }
    return { data };
};

export const savePersona = async (
    supabase: SupabaseClient,
    userId: string,
    input: PersonaInput,
): Promise<ServiceResult<null>> => {
    const { error } = await upsertPersona(supabase, userId, input);
    if (error) {
        console.error(
            "Failed to save persona:",
            error instanceof Error ? error.message : String(error),
        );
        return { error: "Failed to save persona" };
    }
    return { data: null };
};

export const savePersonaSummary = async (
    supabase: SupabaseClient,
    userId: string,
    summary: string,
): Promise<ServiceResult<null>> => {
    const { error } = await updatePersonaSummary(supabase, userId, summary);
    if (error) {
        console.error(
            "Failed to update persona summary:",
            error instanceof Error ? error.message : String(error),
        );
        return { error: "Failed to update persona summary" };
    }
    return { data: null };
};

export const claimPersonaSummary = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<ServiceResult<null>> => {
    return savePersonaSummary(supabase, userId, "pending");
};

/**
 * Generates and saves the initial persona summary after onboarding.
 * Caller must pass the already-fetched PersonaRow to avoid a redundant DB round-trip.
 * Idempotent: returns immediately if summary already exists or no insight is found.
 */
export const ensureInitialPersonaSummary = async (
    supabase: SupabaseClient,
    persona: PersonaRow,
): Promise<void> => {
    const { data: firstInsight, error: insightError } =
        await findFirstEntryInsight(supabase);
    if (insightError || !firstInsight) return;

    const { data: entry, error: entryError } = await findEntryWithInsightById(
        supabase,
        firstInsight.entryId,
    );
    if (entryError || !entry || !entry.content) return;

    const summary = await generateInitialPersonaSummary({
        displayName: persona.displayName,
        q1Answer: Q1_LABEL_MAP[persona.q1Answer] ?? persona.q1Answer,
        q2Answer: Q2_LABEL_MAP[persona.q2Answer] ?? persona.q2Answer,
        q3Answer: Q3_LABEL_MAP[persona.q3Answer] ?? persona.q3Answer,
        q4Answer: Q4_LABEL_MAP[persona.q4Answer] ?? persona.q4Answer,
        firstEntryContent: entry.content,
        firstInsight: firstInsight.content,
    });

    if (!summary) return;

    const { error } = await savePersonaSummary(
        supabase,
        persona.userId,
        summary,
    );
    if (error) {
        console.error("ensureInitialPersonaSummary: failed to save:", error);
    }
};
