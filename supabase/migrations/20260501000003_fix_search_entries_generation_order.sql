-- Fix search_entries_by_embedding after entry_insights moved from 1:1 to 1:N.
-- insight_count was dropped in favor of generation_order, so recreate the RPC
-- with the new return shape while keeping service-role-only execution.

DROP FUNCTION IF EXISTS public.search_entries_by_embedding(
    extensions.vector(1536), text, double precision, integer
);

CREATE FUNCTION public.search_entries_by_embedding(
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
    generation_order integer,
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
        ei.generation_order,
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

REVOKE EXECUTE ON FUNCTION public.search_entries_by_embedding(
    extensions.vector(1536), text, double precision, integer
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.search_entries_by_embedding(
    extensions.vector(1536), text, double precision, integer
) TO service_role;
