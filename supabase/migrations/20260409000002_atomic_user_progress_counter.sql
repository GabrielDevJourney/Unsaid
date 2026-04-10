-- Replace app-level read-then-write on user_progress.total_entries with atomic RPCs.
-- Eliminates the race condition where two concurrent entry creates both read the same
-- count and one increment is silently lost (free-tier bypass vector).

CREATE OR REPLACE FUNCTION increment_entry_count(uid text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE user_progress SET total_entries = total_entries + 1 WHERE user_id = uid;
$$;

CREATE OR REPLACE FUNCTION decrement_entry_count(uid text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE user_progress SET total_entries = GREATEST(0, total_entries - 1) WHERE user_id = uid;
$$;
