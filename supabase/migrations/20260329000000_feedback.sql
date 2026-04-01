-- UNS-302: Feedback board
-- Tables: feedback_items, feedback_upvotes
-- Trigger: sync upvote_count on INSERT/DELETE in feedback_upvotes
-- RLS: approved-only for public, own-row for rate limit, admin full access

-- ─── Enum ────────────────────────────────────────────────────────────────────

CREATE TYPE feedback_status AS ENUM ('open', 'in_progress', 'completed', 'wont_do');

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE public.feedback_items (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title         text NOT NULL,
    description   text NOT NULL,
    status        feedback_status NOT NULL DEFAULT 'open',
    upvote_count  int NOT NULL DEFAULT 0,
    is_approved   boolean NOT NULL DEFAULT false,
    admin_reply   text,
    admin_reply_at timestamptz,
    submitted_by  text NOT NULL,             -- Clerk userId, RLS-only, never selected
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_upvotes (
    feedback_id  uuid NOT NULL REFERENCES public.feedback_items(id) ON DELETE CASCADE,
    user_id      text NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (feedback_id, user_id)       -- one vote per user enforced at DB
);

-- ─── Full-text search column ─────────────────────────────────────────────────

ALTER TABLE public.feedback_items
    ADD COLUMN fts tsvector GENERATED ALWAYS AS (
        to_tsvector('english', title || ' ' || description)
    ) STORED;

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX feedback_items_fts_idx        ON public.feedback_items USING GIN(fts);
CREATE INDEX feedback_items_status_idx     ON public.feedback_items(status);
CREATE INDEX feedback_items_upvote_idx     ON public.feedback_items(upvote_count DESC);
CREATE INDEX feedback_items_approved_idx   ON public.feedback_items(is_approved);
CREATE INDEX feedback_upvotes_user_id_idx  ON public.feedback_upvotes(user_id);

-- ─── Trigger: sync upvote_count ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_feedback_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER                    -- bypasses RLS so trigger can always UPDATE
SET search_path = public
AS $$
DECLARE
    target_id uuid;
BEGIN
    IF TG_OP = 'INSERT' THEN
        target_id := NEW.feedback_id;
    ELSE
        target_id := OLD.feedback_id;
    END IF;

    UPDATE public.feedback_items
    SET upvote_count = (
        SELECT COUNT(*) FROM public.feedback_upvotes WHERE feedback_id = target_id
    )
    WHERE id = target_id;

    RETURN NULL;
END;
$$;

CREATE TRIGGER feedback_upvote_count_sync
    AFTER INSERT OR DELETE ON public.feedback_upvotes
    FOR EACH ROW EXECUTE FUNCTION sync_feedback_upvote_count();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.feedback_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_upvotes ENABLE ROW LEVEL SECURITY;

-- feedback_items: authenticated users see approved items
CREATE POLICY "feedback_items_select_approved"
    ON public.feedback_items FOR SELECT TO authenticated
    USING (is_approved = true);

-- feedback_items: users see their own submissions (rate limit counting)
CREATE POLICY "feedback_items_select_own"
    ON public.feedback_items FOR SELECT TO authenticated
    USING (submitted_by = (auth.jwt() ->> 'sub'));

-- feedback_items: admins see everything
CREATE POLICY "feedback_items_select_admin"
    ON public.feedback_items FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    );

-- feedback_items: authenticated users can submit (submitted_by must match their userId)
CREATE POLICY "feedback_items_insert_authenticated"
    ON public.feedback_items FOR INSERT TO authenticated
    WITH CHECK (submitted_by = (auth.jwt() ->> 'sub'));

-- feedback_items: only admins can update
CREATE POLICY "feedback_items_update_admin"
    ON public.feedback_items FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    );

-- feedback_items: only admins can delete
CREATE POLICY "feedback_items_delete_admin"
    ON public.feedback_items FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    );

-- feedback_upvotes: users see their own votes
CREATE POLICY "feedback_upvotes_select_own"
    ON public.feedback_upvotes FOR SELECT TO authenticated
    USING (user_id = (auth.jwt() ->> 'sub'));

-- feedback_upvotes: authenticated users can add their own vote
CREATE POLICY "feedback_upvotes_insert_authenticated"
    ON public.feedback_upvotes FOR INSERT TO authenticated
    WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- feedback_upvotes: users can remove their own vote
CREATE POLICY "feedback_upvotes_delete_own"
    ON public.feedback_upvotes FOR DELETE TO authenticated
    USING (user_id = (auth.jwt() ->> 'sub'));
