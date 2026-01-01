import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEntryThemePrompt } from "@/lib/ai/generate-entry-theme";
import { getEntriesPaginated } from "@/lib/entries/repo";

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
 * - If user has 0 entries: returns a random default prompt
 * - If user has entries: generates a contextual prompt based on recent entries
 *
 * @param supabase - Supabase client with user context
 * @param userId - Optional user ID (required when using admin client without RLS)
 * @returns Prompt text and whether it's a default prompt
 */
export const getEntryThemePrompt = async (
    supabase: SupabaseClient,
    userId?: string,
): Promise<EntryThemeResult> => {
    // Fetch last 5 entries (or fewer if user has less)
    const { data: entries, count } = await getEntriesPaginated(
        supabase,
        1, // page
        5, // pageSize
        userId, // Pass userId for admin client (no RLS)
    );

    // No entries - return default prompt
    if (!entries || count === 0 || entries.length === 0) {
        return {
            promptText: getRandomDefaultPrompt(),
            isDefault: true,
        };
    }

    // Generate contextual prompt from recent entries
    const formattedEntries = entries.map((entry) => ({
        content: entry.content,
        createdAt: entry.created_at,
    }));

    const generatedPrompt = await generateEntryThemePrompt(formattedEntries);

    // Fallback to default if generation fails
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
