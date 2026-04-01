-- UNS-302: Soft-delete for rejected items + DB-managed admin_reply_at

-- ─── Soft delete ─────────────────────────────────────────────────────────────
-- rejected_at / rejected_by replace hard DELETE so history is preserved
ALTER TABLE public.feedback_items
    ADD COLUMN rejected_at  timestamptz,
    ADD COLUMN rejected_by  text;   -- Clerk userId of the admin who rejected

-- Pending query: only items not yet approved AND not rejected
-- (i.e. WHERE is_approved = false AND rejected_at IS NULL)
-- No index needed — small table, covered by existing feedback_items_approved_idx.

-- ─── admin_reply_at trigger ──────────────────────────────────────────────────
-- Set admin_reply_at automatically when admin_reply changes; app no longer writes it.
CREATE OR REPLACE FUNCTION set_admin_reply_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.admin_reply IS DISTINCT FROM OLD.admin_reply
       AND NEW.admin_reply IS NOT NULL THEN
        NEW.admin_reply_at = now();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER feedback_items_admin_reply_at
    BEFORE UPDATE ON public.feedback_items
    FOR EACH ROW EXECUTE FUNCTION set_admin_reply_at();
