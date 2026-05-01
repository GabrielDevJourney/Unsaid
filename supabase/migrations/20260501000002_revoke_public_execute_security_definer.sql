-- Patch: revoke PUBLIC execute that was missed in 20260501000001_security_hardening.sql.
-- That migration only revoked FROM anon, authenticated but the functions still had
-- a PUBLIC grant (=X/postgres in proacl). REVOKE FROM PUBLIC removes it.

REVOKE EXECUTE ON FUNCTION public.find_related_entries(
    uuid, text, double precision, integer
) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.search_entries_by_embedding(
    extensions.vector(1536), text, double precision, integer
) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.search_weekly_insight_patterns_by_embedding(
    extensions.vector(1536), text, double precision, integer
) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_feedback_upvote_count()
FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.try_consume_rate_limit(
    text, text, timestamptz, integer
) FROM PUBLIC, anon, authenticated;
