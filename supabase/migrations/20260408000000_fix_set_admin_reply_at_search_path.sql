-- Security: fix mutable search_path on set_admin_reply_at (Supabase advisor warning)
-- SET search_path = '' prevents search_path injection attacks.

CREATE OR REPLACE FUNCTION public.set_admin_reply_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.admin_reply IS DISTINCT FROM OLD.admin_reply
       AND NEW.admin_reply IS NOT NULL THEN
        NEW.admin_reply_at = now();
    END IF;
    RETURN NEW;
END;
$$;
