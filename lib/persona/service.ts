import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonaInput } from "@/lib/schemas/persona";
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
