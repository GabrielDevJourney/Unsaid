import { readFile } from "node:fs/promises";
import path from "node:path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

/**
 * Load a prompt file from the prompts directory.
 * Caches in memory after first load.
 */
const promptCache = new Map<string, string>();

export const loadPrompt = async (relativePath: string): Promise<string> => {
    // Return cached if available
    const cached = promptCache.get(relativePath);
    if (cached !== undefined) {
        return cached;
    }

    const fullPath = path.join(PROMPTS_DIR, relativePath);
    const content = await readFile(fullPath, "utf-8");

    promptCache.set(relativePath, content);
    return content;
};

/**
 * Load system prompt (shared across all insight types)
 */
export const loadSystemPrompt = () => loadPrompt("system.md");

/**
 * Load task-specific prompts
 */
export const loadEntryTaskPrompt = () => loadPrompt("tasks/entry.md");
export const loadWeeklyTaskPrompt = () => loadPrompt("tasks/weekly.md");
export const loadProgressTaskPrompt = () => loadPrompt("tasks/progress.md");
