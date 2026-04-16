import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEntryThemePrompt } from "@/lib/ai/generate-entry-theme";
import { getEntriesPaginated } from "@/lib/entries/repo";
import type { ServiceResult } from "@/types";
import { getPromptByEntryId, savePromptForEntry } from "./repo";

/**
 * Default prompts for users with no entries.
 * Designed to be inviting and help new users start journaling.
 */
const DEFAULT_PROMPTS = [
    "What's been on your mind lately that you haven't said out loud?",
    "How are you really feeling today, beyond the usual 'fine'?",
    "What would you tell your best friend if they asked how you're doing?",
    "Is there something you've been avoiding thinking about?",
    "What moment from today stood out, even if it seemed small?",
];

/**
 * Get a random default prompt for new users.
 */
const getRandomDefaultPrompt = (): string => {
    const index = Math.floor(Math.random() * DEFAULT_PROMPTS.length);
    return DEFAULT_PROMPTS[index];
};

interface EntryThemeResult {
    promptText: string;
    isDefault: boolean;
}

/**
 * Get or generate an entry theme prompt for the user.
 *
 * Returns EntryThemeResult instead of ServiceResult intentionally — this function
 * handles all its own fallbacks (empty entries → default, failed generation → default)
 * and always succeeds from the caller's perspective.
 *
 * @param supabase - Supabase client with user context
 * @param userId - Optional user ID (required when using admin client without RLS)
 * @returns Prompt text and whether it's a default prompt
 */
export const getEntryThemePrompt = async (
    supabase: SupabaseClient,
    userId?: string,
): Promise<EntryThemeResult> => {
    const FIRST_PAGE = 1;
    const RECENT_ENTRIES_FOR_CONTEXT = 5;

    const { data: entries, count } = await getEntriesPaginated(
        supabase,
        FIRST_PAGE,
        RECENT_ENTRIES_FOR_CONTEXT,
        userId,
    );

    if (!entries || count === 0 || entries.length === 0) {
        return {
            promptText: getRandomDefaultPrompt(),
            isDefault: true,
        };
    }

    const formattedEntries = entries.map((entry) => ({
        content: entry.content,
        createdAt: entry.createdAt,
    }));

    const generatedPrompt = await generateEntryThemePrompt(formattedEntries);

    if (!generatedPrompt) {
        console.warn("Entry theme generation failed, using default prompt");
        return {
            promptText: getRandomDefaultPrompt(),
            isDefault: true,
        };
    }

    return {
        promptText: generatedPrompt,
        isDefault: false,
    };
};

export const persistPromptForEntry = async (
    supabase: SupabaseClient,
    userId: string,
    promptText: string,
    entryId: string,
): Promise<ServiceResult<null>> => {
    const { error } = await savePromptForEntry(
        supabase,
        userId,
        promptText,
        entryId,
    );
    if (error) {
        console.error("Failed to persist prompt:", error);
        return { error: "Failed to save prompt" };
    }
    return { data: null };
};

export const loadPromptForEntry = async (
    supabase: SupabaseClient,
    entryId: string,
): Promise<ServiceResult<string | null>> => {
    const { data, error } = await getPromptByEntryId(supabase, entryId);
    if (error) {
        console.error("Failed to load prompt:", error);
        return { error: "Failed to load prompt" };
    }
    return { data };
};
