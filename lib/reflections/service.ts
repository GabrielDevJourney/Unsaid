import type { SupabaseClient } from "@supabase/supabase-js";
import { getEntriesByIds } from "@/lib/entries/repo";
import { findEntryInsightsByEntryIds } from "@/lib/entry-insights/repo";
import { findProgressInsightById } from "@/lib/progress-insights/repo";
import { searchPatterns } from "@/lib/semantic-search/service";
import { getPatternById } from "@/lib/weekly-insights/service";

/**
 * Build enriched reflection context for a pattern-sourced journal entry.
 *
 * Fetches the pattern, semantically similar patterns (with full descriptions),
 * the raw entry text, and AI insights from the entries that informed the pattern.
 * Returns a formatted markdown string injected into the AI prompt.
 *
 * Returns empty string on any failure — entry editor works normally without it.
 */
export const getPatternReflectionContext = async (
    supabase: SupabaseClient,
    userId: string,
    patternId: string,
): Promise<string> => {
    try {
        const { data: pattern, error } = await getPatternById(
            supabase,
            patternId,
        );
        if (error || !pattern) return "";

        const evidenceIds = pattern.evidence.map((e) => e.entryId);

        const [relatedResult, insightsResult, entriesResult] =
            await Promise.all([
                searchPatterns(
                    supabase,
                    userId,
                    pattern.description,
                    3,
                    0.4,
                ).catch(() => ({ error: "search failed" }) as const),
                findEntryInsightsByEntryIds(supabase, evidenceIds),
                getEntriesByIds(supabase, evidenceIds),
            ]);

        const lines: string[] = ["**Reflection context:**"];
        lines.push(`Pattern: "${pattern.title}"`);
        lines.push(pattern.description);

        const relatedPatterns =
            "data" in relatedResult && relatedResult.data
                ? relatedResult.data.patterns.filter((p) => p.id !== patternId)
                : [];

        if (relatedPatterns.length > 0) {
            lines.push("\nRelated patterns:");
            for (const p of relatedPatterns) {
                lines.push(`"${p.title}"`);
                lines.push(p.description);
            }
        }

        const insightMap = new Map(
            insightsResult.data.map((i) => [i.entryId, i.content]),
        );
        const entries = entriesResult.data;

        if (entries.length > 0) {
            lines.push("\nEvidence entries:");
            for (const entry of entries) {
                const label =
                    pattern.evidence.find((e) => e.entryId === entry.id)
                        ?.label ?? entry.createdAt;
                lines.push(`\nEntry (${label}):`);
                lines.push(entry.content);
                const insight = insightMap.get(entry.id);
                if (insight) lines.push(`Insight: "${insight}"`);
            }
        }

        return lines.join("\n");
    } catch {
        return "";
    }
};

/**
 * Build enriched reflection context for a progress-sourced journal entry.
 *
 * Fetches the progress insight, raw entry text and AI insights from key entries,
 * and semantically similar patterns (with full descriptions).
 * Returns a formatted markdown string.
 *
 * Returns empty string on any failure — entry editor works normally without it.
 */
export const getProgressReflectionContext = async (
    supabase: SupabaseClient,
    userId: string,
    progressId: string,
): Promise<string> => {
    try {
        const { data: insight, error } = await findProgressInsightById(
            supabase,
            progressId,
        );
        if (error || !insight) return "";

        const keyEntryIds = insight.keyEntryIds ?? [];
        const query = insight.parsedContent?.whatsOnRepeat ?? "";

        const [insightsResult, relatedResult, entriesResult] =
            await Promise.all([
                findEntryInsightsByEntryIds(supabase, keyEntryIds),
                query
                    ? searchPatterns(supabase, userId, query, 3, 0.4).catch(
                          () => ({ error: "search failed" }) as const,
                      )
                    : Promise.resolve({ data: { patterns: [] } }),
                getEntriesByIds(supabase, keyEntryIds),
            ]);

        const lines: string[] = ["**Reflection context:**"];
        if (insight.parsedContent?.headline) {
            lines.push(`Progress insight: "${insight.parsedContent.headline}"`);
        }
        if (query) {
            lines.push(query);
        }

        const insightMap = new Map(
            insightsResult.data.map((i) => [i.entryId, i.content]),
        );
        const entries = entriesResult.data;

        if (entries.length > 0) {
            lines.push("\nEntry insights from this period:");
            for (const entry of entries) {
                lines.push(`\nEntry (${entry.createdAt}):`);
                lines.push(entry.content);
                const entryInsight = insightMap.get(entry.id);
                if (entryInsight) lines.push(`Insight: "${entryInsight}"`);
            }
        }

        const relatedPatterns =
            "data" in relatedResult && relatedResult.data
                ? relatedResult.data.patterns
                : [];

        if (relatedPatterns.length > 0) {
            lines.push("\nRelated patterns:");
            for (const p of relatedPatterns) {
                lines.push(`"${p.title}"`);
                lines.push(p.description);
            }
        }

        return lines.join("\n");
    } catch {
        return "";
    }
};
