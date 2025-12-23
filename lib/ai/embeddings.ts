import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

/**
 * Generate an embedding vector for the given text content.
 * Uses OpenAI's text-embedding-3-small model (~$0.00002/1K tokens).
 *
 * @param content - The text to generate an embedding for
 * @returns The embedding as a JSON string (for Supabase pgvector storage)
 */
export const generateEmbedding = async (content: string): Promise<string> => {
    const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
    });

    // Supabase pgvector expects the embedding as a JSON array string
    return JSON.stringify(embedding);
};
