-- Update RPC functions to return encrypted fields instead of plaintext content
-- This is required after dropping the 'content' column in favor of encrypted_content

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.search_entries_by_embedding(extensions.vector(1536), text, float, int);
DROP FUNCTION IF EXISTS public.find_related_entries(uuid, text, float, int);

-- Recreate search_entries_by_embedding with encrypted fields
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
    similarity float
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
        (1 - (e.embedding <=> query_embedding))::float AS similarity
    FROM public.entries e
    WHERE
        e.user_id = user_id_param
        AND e.embedding IS NOT NULL
        AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Recreate find_related_entries with encrypted fields
CREATE OR REPLACE FUNCTION public.find_related_entries(
    entry_id_param uuid,
    user_id_param text,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
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
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    source_embedding extensions.vector(1536);
BEGIN
    -- Get the embedding of the source entry
    SELECT e.embedding INTO source_embedding
    FROM public.entries e
    WHERE e.id = entry_id_param AND e.user_id = user_id_param;

    -- Return empty if source entry not found or has no embedding
    IF source_embedding IS NULL THEN
        RETURN;
    END IF;

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
        (1 - (e.embedding <=> source_embedding))::float AS similarity
    FROM public.entries e
    WHERE
        e.user_id = user_id_param
        AND e.id != entry_id_param
        AND e.embedding IS NOT NULL
        AND (1 - (e.embedding <=> source_embedding)) >= match_threshold
    ORDER BY e.embedding <=> source_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.search_entries_by_embedding TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_related_entries TO authenticated;
