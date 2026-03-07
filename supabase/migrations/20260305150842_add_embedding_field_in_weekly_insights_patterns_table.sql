-- Add embedding field to weekly_insight_patterns table
ALTER TABLE public.weekly_insight_patterns
    ADD COLUMN embedding vector(1536);

CREATE INDEX ON public.weekly_insight_patterns USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- SEMANTIC SEARCH RPC FUNCTIONS
-- Search weekly_insight_patterns by embedding vector using cosine similarity
-- Returns weekly_insight_patterns with similarity score (1 - cosine_distance, higher = more similar)
-- Using SECURITY DEFINER to bypass RLS (we filter by user_id_param manually for security)
CREATE OR REPLACE FUNCTION public.search_weekly_insight_patterns_by_embedding(query_embedding extensions.vector(1536), user_id_param text, match_threshold float DEFAULT 0.5, match_count int DEFAULT 10)
    RETURNS TABLE(
        id uuid,
        weekly_insight_id uuid,
        title text,
        pattern_type text,
        encrypted_description text,
        description_iv text,
        description_tag text,
        evidence jsonb,
        encrypted_question text,
        question_iv text,
        question_tag text,
        encrypted_suggested_experiment text,
        suggested_experiment_iv text,
        suggested_experiment_tag text,
        created_at timestamp,
        is_viewed boolean,
        week_start date,
        similarity float)
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public,extensions
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        pattern.id,
        pattern.weekly_insight_id,
        pattern.title,
        pattern.pattern_type,
        pattern.encrypted_description,
        pattern.description_iv,
        pattern.description_tag,
        (SELECT COALESCE (
            jsonb_agg(
                jsonb_build_object(
                    'entryId', e.id::text,
                    'label',   to_char(e.created_at, 'FMMonth FMDD')
                )
                ORDER BY e.created_at ASC
            ),
            '[]'::jsonb
        )
            FROM public.entries e
            WHERE e.id = ANY(pattern.evidence)
        ) AS evidence,
        pattern.encrypted_question,
        pattern.question_iv,
        pattern.question_tag,
        pattern.encrypted_suggested_experiment,
        pattern.suggested_experiment_iv,
        pattern.suggested_experiment_tag,
        pattern.created_at,
        pattern.is_viewed,
        wi.week_start,
(1 -(pattern.embedding <=> query_embedding))::float AS similarity -- cosine similarity = 1 - cosine distance
    FROM
        public.weekly_insight_patterns pattern
    INNER JOIN public.weekly_insights wi ON pattern.weekly_insight_id = wi.id
    WHERE
        wi.user_id = user_id_param
        AND pattern.embedding IS NOT NULL
        AND(1 -(pattern.embedding <=> query_embedding)) >= match_threshold
    ORDER BY
        pattern.embedding <=> query_embedding -- order by cosine distance (most similar first)
    LIMIT match_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.search_weekly_insight_patterns_by_embedding TO authenticated;