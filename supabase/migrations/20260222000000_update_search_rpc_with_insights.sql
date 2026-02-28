-- Update search_entries_by_embedding to include entry insight data.
-- Previously only returned entry columns. Now LEFT JOINs entry_insights so
-- search results can display tags and the insight button without a second query.
--
-- LEFT JOIN is used (not INNER JOIN) so entries without insights still appear.
-- Insight columns are prefixed with "insight_" to avoid name clashes with
-- the entry columns (both tables have "id", "created_at", etc.).

DROP FUNCTION IF EXISTS public.search_entries_by_embedding(extensions.vector(1536), text, float, int);

CREATE OR REPLACE FUNCTION public.search_entries_by_embedding(
    query_embedding extensions.vector(1536),
    user_id_param text,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    user_id text,
    encrypted_content text,
    content_iv text,
    content_tag text,
    word_count integer,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float,
    insight_id uuid,
    insight_encrypted_content text,
    insight_content_iv text,
    insight_content_tag text,
    insight_tags text[],
    insight_count integer,
    insight_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.user_id,
        e.encrypted_content,
        e.content_iv,
        e.content_tag,
        e.word_count,
        e.created_at,
        e.updated_at,
        (1 - (e.embedding <=> query_embedding))::float AS similarity,
        ei.id AS insight_id,
        ei.encrypted_content AS insight_encrypted_content,
        ei.content_iv AS insight_content_iv,
        ei.content_tag AS insight_content_tag,
        ei.tags AS insight_tags,
        ei.insight_count AS insight_count,
        ei.created_at AS insight_created_at
    FROM public.entries e
    LEFT JOIN public.entry_insights ei ON ei.entry_id = e.id
    WHERE
        e.user_id = user_id_param
        AND e.embedding IS NOT NULL
        AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_entries_by_embedding TO authenticated;
