import type { SupabaseClient } from "@supabase/supabase-js";

export const savePromptForEntry = async (
    supabase: SupabaseClient,
    userId: string,
    promptText: string,
    entryId: string,
): Promise<void> => {
    await supabase.from("prompts").insert({
        user_id: userId,
        prompt_text: promptText,
        entry_id: entryId,
        is_used: true,
    });
};

export const getPromptByEntryId = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<string | null> => {
    const { data } = await supabase
        .from("prompts")
        .select("prompt_text")
        .eq("entry_id", entryId)
        .single();

    return data?.prompt_text ?? null;
};
