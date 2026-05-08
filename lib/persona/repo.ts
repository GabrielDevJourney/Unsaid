import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonaInput } from "@/lib/schemas/persona";

export interface PersonaRow {
    userId: string;
    displayName: string;
    q1Answer: string;
    q2Answer: string;
    q3Answer: string;
    q4Answer: string;
    summary: string | null;
}

export const findPersona = async (
    supabase: SupabaseClient,
    userId: string,
): Promise<{ data: PersonaRow | null; error: Error | null }> => {
    const { data, error } = await supabase
        .from("user_persona")
        .select(
            "user_id, display_name, q1_answer, q2_answer, q3_answer, q4_answer, summary",
        )
        .eq("user_id", userId)
        .single();

    if (error) {
        if ((error as { code?: string }).code === "PGRST116")
            return { data: null, error: null };
        return { data: null, error: error as Error };
    }
    if (!data) return { data: null, error: null };

    return {
        data: {
            userId: data.user_id,
            displayName: data.display_name,
            q1Answer: data.q1_answer,
            q2Answer: data.q2_answer,
            q3Answer: data.q3_answer,
            q4Answer: data.q4_answer,
            summary: data.summary,
        },
        error: null,
    };
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
    const { error } = await supabase
        .from("user_persona")
        .update({ summary, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

    return { error: error as Error | null };
};
