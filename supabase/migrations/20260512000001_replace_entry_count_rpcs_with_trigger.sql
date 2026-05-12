-- Replace SECURITY DEFINER RPCs with a DB trigger.
-- The old functions were callable by the authenticated role via REST, letting
-- free-tier users POST to /rpc/decrement_entry_count to lower their counter
-- and bypass the 15-entry limit. A trigger fires server-side only — no REST
-- endpoint exists for it.

CREATE OR REPLACE FUNCTION public.sync_entry_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_progress
        SET total_entries = total_entries + 1
        WHERE user_id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_progress
        SET total_entries = GREATEST(total_entries - 1, 0)
        WHERE user_id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_entry_count ON entries;

CREATE TRIGGER trg_sync_entry_count
AFTER INSERT OR DELETE ON entries
FOR EACH ROW EXECUTE FUNCTION sync_entry_count();

-- Drop no-arg versions (exposed in prod, flagged by Supabase advisor).
DROP FUNCTION IF EXISTS public.increment_entry_count();
DROP FUNCTION IF EXISTS public.decrement_entry_count();
-- Drop (text) overloads created in 20260409000002 if they exist.
DROP FUNCTION IF EXISTS public.increment_entry_count(text);
DROP FUNCTION IF EXISTS public.decrement_entry_count(text);
