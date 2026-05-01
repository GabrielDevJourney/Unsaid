-- Fix auth_rls_initplan warnings: rebuild all user-scoped RLS policies using the
-- canonical lowercase (select auth.jwt() ->> 'sub') subquery form so Postgres
-- evaluates the JWT call once per statement, not once per row.
--
-- Also merges 3 permissive SELECT policies on feedback_items into 1
-- to fix the multiple_permissive_policies warning.

-- ─── users ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (user_id = (select auth.jwt() ->> 'sub'));

-- ─── entries ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can create own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.entries;

CREATE POLICY "Users can view own entries" ON public.entries
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can create own entries" ON public.entries
    FOR INSERT
    WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own entries" ON public.entries
    FOR UPDATE
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete own entries" ON public.entries
    FOR DELETE
    USING (user_id = (select auth.jwt() ->> 'sub'));

-- ─── entry_insights ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own entry insights" ON public.entry_insights;

CREATE POLICY "Users can view own entry insights" ON public.entry_insights
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

-- ─── weekly_insights ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own weekly insights" ON public.weekly_insights;

CREATE POLICY "Users can view own weekly insights" ON public.weekly_insights
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

-- ─── weekly_insight_patterns ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own weekly insight patterns" ON public.weekly_insight_patterns;
DROP POLICY IF EXISTS "Users can update own weekly insight patterns" ON public.weekly_insight_patterns;

CREATE POLICY "Users can view own weekly insight patterns" ON public.weekly_insight_patterns
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.weekly_insights wi
            WHERE wi.id = weekly_insight_id
              AND wi.user_id = (select auth.jwt() ->> 'sub')
        )
    );

CREATE POLICY "Users can update own weekly insight patterns" ON public.weekly_insight_patterns
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.weekly_insights wi
            WHERE wi.id = weekly_insight_patterns.weekly_insight_id
              AND wi.user_id = (select auth.jwt() ->> 'sub')
        )
    );

-- ─── progress_insights ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own progress insights" ON public.progress_insights;
DROP POLICY IF EXISTS "Users can update is_viewed on their own progress insights" ON public.progress_insights;

CREATE POLICY "Users can view own progress insights" ON public.progress_insights
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update is_viewed on their own progress insights" ON public.progress_insights
    FOR UPDATE
    USING (user_id = (select auth.jwt() ->> 'sub'))
    WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

-- ─── prompts ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create own prompts" ON public.prompts;

CREATE POLICY "Users can view own prompts" ON public.prompts
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own prompts" ON public.prompts
    FOR UPDATE
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can create own prompts" ON public.prompts
    FOR INSERT
    WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

-- ─── user_progress ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE
    TO authenticated
    USING (user_id = (select auth.jwt() ->> 'sub'))
    WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

-- ─── feedback ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can create own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON public.feedback;

CREATE POLICY "Users can create own feedback" ON public.feedback
    FOR INSERT
    WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own feedback" ON public.feedback
    FOR UPDATE
    USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete own feedback" ON public.feedback
    FOR DELETE
    USING ((select auth.jwt() ->> 'sub') = user_id);

-- ─── feedback_votes ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can create own votes" ON public.feedback_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.feedback_votes;

CREATE POLICY "Users can create own votes" ON public.feedback_votes
    FOR INSERT
    WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete own votes" ON public.feedback_votes
    FOR DELETE
    USING ((select auth.jwt() ->> 'sub') = user_id);

-- ─── subscriptions ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

-- ─── onboarding_previews ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users can read own onboarding preview" ON public.onboarding_previews;
DROP POLICY IF EXISTS "users can insert own onboarding preview" ON public.onboarding_previews;

CREATE POLICY "users can read own onboarding preview" ON public.onboarding_previews
    FOR SELECT
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "users can insert own onboarding preview" ON public.onboarding_previews
    FOR INSERT
    WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

-- ─── feedback_items ──────────────────────────────────────────────────────────
-- Merge 3 permissive SELECT policies into 1 (fixes multiple_permissive_policies).
-- Add (select ...) wrapper to all auth.jwt() comparisons.

DROP POLICY IF EXISTS "feedback_items_select_approved" ON public.feedback_items;
DROP POLICY IF EXISTS "feedback_items_select_own" ON public.feedback_items;
DROP POLICY IF EXISTS "feedback_items_select_admin" ON public.feedback_items;
DROP POLICY IF EXISTS "feedback_items_insert_authenticated" ON public.feedback_items;
DROP POLICY IF EXISTS "feedback_items_update_admin" ON public.feedback_items;
DROP POLICY IF EXISTS "feedback_items_delete_admin" ON public.feedback_items;

CREATE POLICY "feedback_items_select"
    ON public.feedback_items FOR SELECT TO authenticated
    USING (
        is_approved = true
        OR submitted_by = (select auth.jwt() ->> 'sub')
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (select auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    );

CREATE POLICY "feedback_items_insert_authenticated"
    ON public.feedback_items FOR INSERT TO authenticated
    WITH CHECK (submitted_by = (select auth.jwt() ->> 'sub'));

CREATE POLICY "feedback_items_update_admin"
    ON public.feedback_items FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (select auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (select auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    );

CREATE POLICY "feedback_items_delete_admin"
    ON public.feedback_items FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = (select auth.jwt() ->> 'sub')
              AND role = 'admin'
        )
    );

-- ─── feedback_upvotes ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "feedback_upvotes_select_own" ON public.feedback_upvotes;
DROP POLICY IF EXISTS "feedback_upvotes_insert_authenticated" ON public.feedback_upvotes;
DROP POLICY IF EXISTS "feedback_upvotes_delete_own" ON public.feedback_upvotes;

CREATE POLICY "feedback_upvotes_select_own"
    ON public.feedback_upvotes FOR SELECT TO authenticated
    USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "feedback_upvotes_insert_authenticated"
    ON public.feedback_upvotes FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "feedback_upvotes_delete_own"
    ON public.feedback_upvotes FOR DELETE TO authenticated
    USING (user_id = (select auth.jwt() ->> 'sub'));
