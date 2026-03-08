-- 1. Allow users to update is_viewed on their own patterns.
--    The join to weekly_insights resolves ownership since patterns
--    don't have a direct user_id column.
CREATE POLICY "Users can update own weekly insight patterns" ON public.weekly_insight_patterns
    FOR UPDATE
        USING (
            EXISTS (
                SELECT 1
                FROM public.weekly_insights wi
                WHERE wi.id = weekly_insight_patterns.weekly_insight_id
                  AND wi.user_id = (auth.jwt() ->> 'sub')
            )
        );

-- 2. Replace SECURITY DEFINER RPC with SECURITY INVOKER.
--    RLS on weekly_insights, weekly_insight_patterns, and entries
--    filters automatically via the caller's Clerk JWT — no p_user_id needed.
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
                                    'label',   to_char(e.created_at, 'FMMonth FMDD')
                                )
                                ORDER BY e.created_at ASC
                            ),
                            '[]'::jsonb
                        )
                        FROM public.entries e
                        WHERE e.id = ANY(wip.evidence)
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

GRANT EXECUTE ON FUNCTION public.get_weekly_insights_with_evidence TO authenticated;
