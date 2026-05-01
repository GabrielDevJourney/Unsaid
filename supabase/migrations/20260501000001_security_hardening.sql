-- Security hardening: close SECURITY DEFINER function exposure and storage listing.

-- ─── 2a. increment/decrement_entry_count — remove caller-supplied uid param ──
--
-- Old signatures accepted an arbitrary uid text param, allowing any authenticated
-- user to manipulate another user's counter via the REST RPC endpoint.
-- New signatures derive identity from the calling user's JWT internally.
-- Supersedes 20260428000002_restrict_progress_counter_rpcs.sql (which restricted
-- to service_role; authenticated is correct because callers use createSupabaseServer).

DROP FUNCTION IF EXISTS public.increment_entry_count(text);
DROP FUNCTION IF EXISTS public.decrement_entry_count(text);

CREATE FUNCTION public.increment_entry_count()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE user_progress
  SET total_entries = total_entries + 1
  WHERE user_id = (select auth.jwt() ->> 'sub');
$$;

CREATE FUNCTION public.decrement_entry_count()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE user_progress
  SET total_entries = GREATEST(0, total_entries - 1)
  WHERE user_id = (select auth.jwt() ->> 'sub');
$$;

REVOKE ALL ON FUNCTION public.increment_entry_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_entry_count() TO authenticated;

REVOKE ALL ON FUNCTION public.decrement_entry_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_entry_count() TO authenticated;

-- ─── 2b. Semantic search functions — service-role only ────────────────────────
--
-- These functions accept a user_id_param and are called exclusively via
-- createSupabaseAdmin() (no JWT context). They must not be callable by
-- anon or authenticated via the REST API.

REVOKE EXECUTE ON FUNCTION public.search_entries_by_embedding(
    extensions.vector(1536), text, double precision, integer
) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.find_related_entries(
    uuid, text, double precision, integer
) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.search_weekly_insight_patterns_by_embedding(
    extensions.vector(1536), text, double precision, integer
) FROM anon, authenticated;

-- ─── 2c. try_consume_rate_limit — already revoked from PUBLIC, remove explicit grants ──
--
-- 20260428000001 revoked from PUBLIC but Supabase re-grants to anon/authenticated
-- by default on all new functions. Explicitly revoke both roles.

REVOKE EXECUTE ON FUNCTION public.try_consume_rate_limit(
    text, text, timestamptz, integer
) FROM anon, authenticated;

-- ─── 2d. sync_feedback_upvote_count — trigger-only, never called directly ────

REVOKE EXECUTE ON FUNCTION public.sync_feedback_upvote_count() FROM anon, authenticated;

-- ─── 2e. feedback-media storage — remove list enumeration ────────────────────
--
-- The bucket is public: true, which enables direct-URL object access without
-- needing a SELECT policy. The SELECT policy additionally enabled list()
-- enumeration of all uploaded files. Dropping it removes that exposure.

DROP POLICY IF EXISTS "Public can read feedback media" ON storage.objects;
