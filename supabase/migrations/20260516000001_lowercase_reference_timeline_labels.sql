-- Fix: evidence label dates were title-cased ("April 15") — lowercase them ("april 15").
-- Change: to_char(e.created_at, 'FMMonth FMDD') → lower(to_char(e.created_at, 'FMMonth FMDD'))
-- Applies to both RPC functions that build the evidence jsonb.

-- ── get_weekly_insights_with_evidence ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_weekly_insights_with_evidence(
    p_cursor   date  DEFAULT NULL,
    p_limit    int   DEFAULT 10
)
RETURNS TABLE (
    id         uuid,
    user_id    text,
    week_start text,
    entry_ids  text[],
    created_at text,
    updated_at text,
    patterns   jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        wi.id,
        wi.user_id,
        wi.week_start::text,
        wi.entry_ids::text[],
        wi.created_at::text,
        wi.updated_at::text,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id',                             wip.id,
                    'weekly_insight_id',              wip.weekly_insight_id,
                    'title',                          wip.title,
                    'pattern_type',                   wip.pattern_type,
                    'encrypted_description',          wip.encrypted_description,
                    'description_iv',                 wip.description_iv,
                    'description_tag',                wip.description_tag,
                    'evidence', (
                        SELECT COALESCE(
                            jsonb_agg(
                                jsonb_build_object(
                                    'entryId', e.id::text,
                                    'label',   lower(to_char(e.created_at, 'FMMonth FMDD'))
                                )
                                ORDER BY e.created_at ASC
                            ),
                            '[]'::jsonb
                        )
                        FROM public.entries e
                        WHERE e.id = ANY(wip.evidence)
                          AND e.user_id = wi.user_id
                    ),
                    'encrypted_question',             wip.encrypted_question,
                    'question_iv',                    wip.question_iv,
                    'question_tag',                   wip.question_tag,
                    'encrypted_suggested_experiment', wip.encrypted_suggested_experiment,
                    'suggested_experiment_iv',        wip.suggested_experiment_iv,
                    'suggested_experiment_tag',       wip.suggested_experiment_tag,
                    'created_at',                     wip.created_at::text,
                    'is_viewed',                      wip.is_viewed
                )
                ORDER BY wip.created_at ASC
            ) FILTER (WHERE wip.id IS NOT NULL),
            '[]'::jsonb
        ) AS patterns
    FROM public.weekly_insights wi
    LEFT JOIN public.weekly_insight_patterns wip
        ON wip.weekly_insight_id = wi.id
    WHERE (p_cursor IS NULL OR wi.week_start < p_cursor)
    GROUP BY wi.id, wi.user_id, wi.week_start, wi.entry_ids, wi.created_at, wi.updated_at
    ORDER BY wi.week_start DESC
    LIMIT p_limit;
END;
$$;

-- ── search_weekly_insight_patterns_by_embedding ───────────────────────────────
-- DROP required because CREATE OR REPLACE cannot change a function's return type
-- (the 20260408185120 migration already fixed timestamptz; preserve that).

DROP FUNCTION IF EXISTS public.search_weekly_insight_patterns_by_embedding(
    extensions.vector(1536), text, double precision, integer
);

CREATE FUNCTION public.search_weekly_insight_patterns_by_embedding(
    query_embedding extensions.vector(1536),
    user_id_param text,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
)
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
    created_at timestamptz,
    is_viewed boolean,
    week_start date,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
        (SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'entryId', e.id::text,
                    'label',   lower(to_char(e.created_at, 'FMMonth FMDD'))
                )
                ORDER BY e.created_at ASC
            ),
            '[]'::jsonb
        )
        FROM public.entries e
        WHERE e.id = ANY(pattern.evidence)
          AND e.user_id = wi.user_id
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
        (1 - (pattern.embedding <=> query_embedding))::float AS similarity
    FROM public.weekly_insight_patterns pattern
    INNER JOIN public.weekly_insights wi ON pattern.weekly_insight_id = wi.id
    WHERE
        wi.user_id = user_id_param
        AND pattern.embedding IS NOT NULL
        AND (1 - (pattern.embedding <=> query_embedding)) >= match_threshold
    ORDER BY pattern.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- service-role only — no grant to anon/authenticated (enforced by 20260501000001)
REVOKE ALL ON FUNCTION public.search_weekly_insight_patterns_by_embedding(
    extensions.vector(1536), text, double precision, integer
) FROM PUBLIC, anon, authenticated;
