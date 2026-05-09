import type { SupabaseClient } from "@supabase/supabase-js";
import { encrypt } from "@/lib/crypto";
import type { PersonaInput } from "@/lib/schemas/persona";
import { toPersonaRow } from "./transformers";

export type { PersonaRow } from "./transformers";

const SELECT_FIELDS =
    "user_id, display_name, q1_answer, q2_answer, q3_answer, q4_answer, encrypted_summary, summary_iv, summary_tag";

export const findPersona = async (supabase: SupabaseClient, userId: string) => {
    const { data, error } = await supabase
        .from("user_persona")
        .select(SELECT_FIELDS)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) return { data: null, error: error as Error };
    if (!data) return { data: null, error: null };
    return { data: toPersonaRow(data), error: null };
};

export const upsertPersona = async (
    supabase: SupabaseClient,
    userId: string,
    input: PersonaInput,
): Promise<{ error: Error | null }> => {
    const { error } = await supabase.from("user_persona").upsert({
        user_id: userId,
        display_name: input.displayName,
        q1_answer: input.q1Answer,
        q2_answer: input.q2Answer,
        q3_answer: input.q3Answer,
        q4_answer: input.q4Answer,
        updated_at: new Date().toISOString(),
    });

    return { error: error as Error | null };
};

export const updatePersonaSummary = async (
    supabase: SupabaseClient,
    userId: string,
    summary: string,
): Promise<{ error: Error | null }> => {
    const { encryptedContent, iv, tag } = encrypt(summary);
    const { error } = await supabase
        .from("user_persona")
        .update({
            encrypted_summary: encryptedContent,
            summary_iv: iv,
            summary_tag: tag,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

    return { error: error as Error | null };
};
