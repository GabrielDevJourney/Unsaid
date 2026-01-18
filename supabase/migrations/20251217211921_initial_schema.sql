-- RLS uses auth.jwt()->>'sub' which contains the Clerk user ID.
-- All policies use (SELECT auth.jwt()) for performance (evaluated once per query).
-- Enable pgvector for semantic search (in public schema for simpler usage)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- TABLES
-- USERS TABLE
CREATE TABLE public.users(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text UNIQUE NOT NULL,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    trial_started_at timestamptz DEFAULT now(),
    trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX users_user_id_idx ON public.users(user_id);
CREATE INDEX users_role_idx ON public.users(role) WHERE role = 'admin';

-- ENTRIES TABLE
CREATE TABLE public.entries(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    content text NOT NULL,
    word_count integer NOT NULL DEFAULT 0,
    embedding vector(1536),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX entries_user_created_idx ON public.entries(user_id, created_at DESC);

CREATE INDEX entries_embedding_idx ON public.entries USING ivfflat(embedding extensions.vector_cosine_ops) WITH (lists = 100);

-- ENTRY_INSIGHTS TABLE (Tier 1: one per entry, text response)
CREATE TABLE public.entry_insights(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    entry_id uuid NOT NULL UNIQUE REFERENCES public.entries(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX entry_insights_user_idx ON public.entry_insights(user_id, created_at DESC);

-- WEEKLY_INSIGHTS TABLE (Tier 2: one per calendar week)
CREATE TABLE public.weekly_insights(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    week_start date NOT NULL,
    entry_ids uuid[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, week_start)
);

CREATE INDEX weekly_insights_user_week_idx ON public.weekly_insights(user_id, week_start DESC);

-- WEEKLY_INSIGHT_PATTERNS TABLE (insight cards for weekly analysis)
CREATE TABLE public.weekly_insight_patterns(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_insight_id uuid NOT NULL REFERENCES public.weekly_insights(id) ON DELETE CASCADE,
    title text NOT NULL,
    pattern_type text NOT NULL CHECK (pattern_type IN (
        'theme', 'trigger', 'thought_pattern',
        'avoidance', 'habit', 'need', 'growth'
    )),
    description text NOT NULL,
    evidence uuid[] NOT NULL DEFAULT '{}',
    question text,
    suggested_experiment text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weekly_insight_patterns_insight_idx ON public.weekly_insight_patterns(weekly_insight_id);
CREATE INDEX weekly_insight_patterns_type_idx ON public.weekly_insight_patterns(pattern_type);

-- PROGRESS_INSIGHTS TABLE (Tier 3: triggered every N entries, text report)
CREATE TABLE public.progress_insights(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    content text NOT NULL,
    recent_entry_ids uuid[] NOT NULL DEFAULT '{}',
    related_past_entry_ids uuid[] DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX progress_insights_user_idx ON public.progress_insights(user_id, created_at DESC);

-- PROMPTS TABLE
CREATE TABLE public.prompts(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    prompt_text text NOT NULL,
    is_used boolean DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX prompts_user_unused_idx ON public.prompts(user_id, is_used, created_at DESC);

-- USER_PROGRESS TABLE
CREATE TABLE public.user_progress(
    user_id text PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    total_entries integer NOT NULL DEFAULT 0,
    entry_count_at_last_progress integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- FEEDBACK TABLE (community-driven feature prioritization)
CREATE TABLE public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.feedback(id) ON DELETE CASCADE, -- For comments
    title text, -- NULL if comment
    description text NOT NULL,
    category text CHECK (category IN ('bug', 'feature', 'improvement', 'other')),
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'planned', 'in_progress', 'completed', 'wont_do')),
    upvotes integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX feedback_status_votes_idx ON public.feedback(status, upvotes DESC);
CREATE INDEX feedback_user_idx ON public.feedback(user_id);
CREATE INDEX feedback_parent_idx ON public.feedback(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX feedback_created_idx ON public.feedback(created_at DESC);

-- FEEDBACK_VOTES TABLE (one vote per user per feedback)
CREATE TABLE public.feedback_votes (
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    feedback_id uuid NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, feedback_id)
);

CREATE INDEX feedback_votes_feedback_idx ON public.feedback_votes(feedback_id);

-- SUBSCRIPTIONS TABLE (1:1 with users, source of truth for billing)
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text UNIQUE NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'canceled', 'expired')),
    trial_ends_at timestamptz,
    lemon_subscription_id text,          -- null during trial
    lemon_customer_id text,              -- null during trial
    plan_id text,                        -- null during trial
    current_period_end timestamptz,      -- null during trial
    canceled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX subscriptions_trial_ends_idx ON public.subscriptions(trial_ends_at) WHERE status = 'trial';
CREATE INDEX subscriptions_lemon_sub_idx ON public.subscriptions(lemon_subscription_id) WHERE lemon_subscription_id IS NOT NULL;

-- PAYMENT_EVENTS TABLE (webhook idempotency + audit trail)
CREATE TABLE public.payment_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text REFERENCES public.users(user_id) ON DELETE SET NULL,
    event_type text NOT NULL,
    lemon_event_id text UNIQUE NOT NULL,  -- prevents double-processing
    payload jsonb NOT NULL,
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payment_events_user_idx ON public.payment_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX payment_events_type_idx ON public.payment_events(event_type);
CREATE INDEX payment_events_created_idx ON public.payment_events(created_at DESC);

-- WAITLIST TABLE (pre-launch email collection)
CREATE TABLE public.waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    source text DEFAULT 'landing_page',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX waitlist_email_idx ON public.waitlist(email);
CREATE INDEX waitlist_created_idx ON public.waitlist(created_at DESC);

-- TRIGGERS: Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = ''
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER entries_updated_at
    BEFORE UPDATE ON public.entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER entry_insights_updated_at
    BEFORE UPDATE ON public.entry_insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER weekly_insights_updated_at
    BEFORE UPDATE ON public.weekly_insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER progress_insights_updated_at
    BEFORE UPDATE ON public.progress_insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.entry_insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.weekly_insight_patterns ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.progress_insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Service webhook can create users" ON public.users
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- ENTRIES policies
CREATE POLICY "Users can view own entries" ON public.entries
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can create own entries" ON public.entries
    FOR INSERT
        WITH CHECK ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own entries" ON public.entries
    FOR UPDATE
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete own entries" ON public.entries
    FOR DELETE
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- ENTRY_INSIGHTS policies (read-only for users, created by system)
CREATE POLICY "Users can view own entry insights" ON public.entry_insights
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- WEEKLY_INSIGHTS policies (read-only for users, created by system)
CREATE POLICY "Users can view own weekly insights" ON public.weekly_insights
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- WEEKLY_INSIGHT_PATTERNS policies (read-only for users, created by system)
CREATE POLICY "Users can view own weekly insight patterns" ON public.weekly_insight_patterns
    FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.weekly_insights wi
                WHERE wi.id = weekly_insight_id
                AND wi.user_id = (SELECT auth.jwt() ->> 'sub')
            )
        );

-- PROGRESS_INSIGHTS policies (read-only for users, created by system)
CREATE POLICY "Users can view own progress insights" ON public.progress_insights
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- PROMPTS policies
CREATE POLICY "Users can view own prompts" ON public.prompts
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own prompts" ON public.prompts
    FOR UPDATE
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- USER_PROGRESS policies (read-only for users, updated by system)
CREATE POLICY "Service webhook can insert init user progress" ON public.user_progress
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- FEEDBACK policies (auth required for all operations)
CREATE POLICY "Authenticated users can view feedback" ON public.feedback
    FOR SELECT
    USING ((SELECT auth.jwt()) IS NOT NULL);

CREATE POLICY "Users can create own feedback" ON public.feedback
    FOR INSERT
    WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own feedback" ON public.feedback
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete own feedback" ON public.feedback
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'sub') = user_id);

-- FEEDBACK_VOTES policies
CREATE POLICY "Authenticated users can view votes" ON public.feedback_votes
    FOR SELECT
    USING ((SELECT auth.jwt()) IS NOT NULL);

CREATE POLICY "Users can create own votes" ON public.feedback_votes
    FOR INSERT
    WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete own votes" ON public.feedback_votes
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'sub') = user_id);

-- SUBSCRIPTIONS policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT
    USING ((SELECT auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Service can manage subscriptions" ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- PAYMENT_EVENTS policies (internal only - service role access)
CREATE POLICY "Service can manage payment events" ON public.payment_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- WAITLIST policies (public insert for landing page, service role for management)
-- Validate email format at RLS level for defense in depth
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
    FOR INSERT
    TO anon
    WITH CHECK (
        email IS NOT NULL
        AND length(email) >= 5
        AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    );

CREATE POLICY "Service can manage waitlist" ON public.waitlist
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- GRANTS: API Access for PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Users table
GRANT INSERT ON public.users TO service_role;

GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Entries table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;

-- Insight tables (read-only for users)
GRANT SELECT ON public.entry_insights TO authenticated;

GRANT SELECT ON public.weekly_insights TO authenticated;

GRANT SELECT ON public.weekly_insight_patterns TO authenticated;

GRANT SELECT ON public.progress_insights TO authenticated;

-- Prompts table
GRANT SELECT, UPDATE ON public.prompts TO authenticated;

-- User progress table (read-only)
GRANT INSERT ON public.user_progress TO service_role;

GRANT SELECT ON public.user_progress TO authenticated;

-- Feedback tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.feedback_votes TO authenticated;

-- Subscriptions table (users can read, service can write)
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

-- Payment events table (service role only)
GRANT ALL ON public.payment_events TO service_role;

-- Waitlist table (anon can insert, service role has full access)
GRANT INSERT ON public.waitlist TO anon;
GRANT ALL ON public.waitlist TO service_role;

-- Sequences (needed for uuid generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- SEMANTIC SEARCH RPC FUNCTIONS
-- Search entries by embedding vector using cosine similarity
-- Returns entries with similarity score (1 - cosine_distance, higher = more similar)
-- Using SECURITY DEFINER to bypass RLS (we filter by user_id_param manually for security)
CREATE OR REPLACE FUNCTION public.search_entries_by_embedding(
    query_embedding vector(1536),
    user_id_param text,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    user_id text,
    content text,
    word_count integer,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.user_id,
        e.content,
        e.word_count,
        e.created_at,
        e.updated_at,
        -- Cosine similarity: 1 - cosine_distance (using <=> operator)
        (1 - (e.embedding <=> query_embedding))::float AS similarity
    FROM public.entries e
    WHERE
        e.user_id = user_id_param
        AND e.embedding IS NOT NULL
        AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Find entries related to a specific entry by semantic similarity
-- Excludes the source entry from results
-- Using SECURITY DEFINER to bypass RLS (we filter by user_id_param manually for security)
CREATE OR REPLACE FUNCTION public.find_related_entries(
    entry_id_param uuid,
    user_id_param text,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    user_id text,
    content text,
    word_count integer,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    source_embedding vector(1536);
BEGIN
    -- Get the embedding of the source entry
    SELECT e.embedding INTO source_embedding
    FROM public.entries e
    WHERE e.id = entry_id_param AND e.user_id = user_id_param;

    -- Return empty if source entry not found or has no embedding
    IF source_embedding IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        e.id,
        e.user_id,
        e.content,
        e.word_count,
        e.created_at,
        e.updated_at,
        -- Cosine similarity: 1 - cosine_distance (using <=> operator)
        (1 - (e.embedding <=> source_embedding))::float AS similarity
    FROM public.entries e
    WHERE
        e.user_id = user_id_param
        AND e.id != entry_id_param
        AND e.embedding IS NOT NULL
        AND (1 - (e.embedding <=> source_embedding)) >= match_threshold
    ORDER BY e.embedding <=> source_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.search_entries_by_embedding TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_related_entries TO authenticated;
