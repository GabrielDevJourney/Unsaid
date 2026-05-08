import type { SupabaseClient } from "@supabase/supabase-js";
import { generateInitialPersonaSummary } from "@/lib/ai/generate-persona-summary";
import { findEntryEncryptedFields } from "@/lib/entries/repo";
import { decryptEntryContent } from "@/lib/entries/transformers";
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
        console.error("Failed to fetch persona:", error);
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
        console.error("Failed to save persona:", error);
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
        console.error("Failed to update persona summary:", error);
        return { error: "Failed to update persona summary" };
    }
    return { data: null };
};

/**
 * Generates and saves the initial persona summary on first /home visit.
 * Idempotent: returns immediately if summary already exists or no insight found.
 * Uses the user-scoped Supabase client (RLS enforced, no admin bypass).
 */
export const ensureInitialPersonaSummary = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<void> => {
    const { data: persona } = await findPersona(supabase, userId);
    if (!persona || persona.summary) return;

    const { data: firstInsight } = await findFirstEntryInsight(supabase);
    if (!firstInsight) return;

    const { data: encryptedRow } = await findEntryEncryptedFields(
        supabase,
        firstInsight.entryId,
    );
    if (!encryptedRow) return;

    const entryContent = decryptEntryContent(encryptedRow);
    if (!entryContent) return;

    const summary = await generateInitialPersonaSummary({
        displayName: persona.displayName,
        q1Answer: Q1_LABEL_MAP[persona.q1Answer] ?? persona.q1Answer,
        q2Answer: Q2_LABEL_MAP[persona.q2Answer] ?? persona.q2Answer,
        q3Answer: Q3_LABEL_MAP[persona.q3Answer] ?? persona.q3Answer,
        q4Answer: Q4_LABEL_MAP[persona.q4Answer] ?? persona.q4Answer,
        firstEntryContent: entryContent,
        firstInsight: firstInsight.content,
    });

    if (!summary) return;

    const { error } = await savePersonaSummary(supabase, userId, summary);
    if (error) {
        console.error("Failed to save initial persona summary:", error);
    }
};
