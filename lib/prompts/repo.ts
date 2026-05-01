import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export const createPromptForEntry = async (
    supabase: SupabaseClient,
    userId: string,
    promptText: string,
    entryId: string,
): Promise<{ data: null; error: PostgrestError | null }> => {
    const promptValues = {
        prompt_text: promptText,
        is_used: true,
        updated_at: new Date().toISOString(),
    };

    const { data: updatedRows, error: updateError } = await supabase
        .from("prompts")
        .update(promptValues)
        .eq("user_id", userId)
        .eq("entry_id", entryId)
        .select("id")
        .limit(1);

    if (updateError) {
        return { data: null, error: updateError };
    }

    if ((updatedRows?.length ?? 0) > 0) {
        return { data: null, error: null };
    }

    const { error: insertError } = await supabase.from("prompts").insert({
        user_id: userId,
        prompt_text: promptText,
        entry_id: entryId,
        is_used: true,
    });

    return { data: null, error: insertError };
};

export const findPromptByEntryId = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<{ data: string | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("prompts")
        .select("prompt_text")
        .eq("entry_id", entryId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    return { data: data?.prompt_text ?? null, error };
};
