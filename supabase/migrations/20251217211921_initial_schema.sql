-- RLS uses auth.jwt()->>'sub' which contains the Clerk user ID.
-- All policies use (SELECT auth.jwt()) for performance (evaluated once per query).
-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- TABLES
-- USERS TABLE
CREATE TABLE public.users(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text UNIQUE NOT NULL,
    email text NOT NULL,
    subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    trial_started_at timestamptz DEFAULT now(),
    trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX users_user_id_idx ON public.users(user_id);

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

CREATE INDEX entries_embedding_idx ON public.entries USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

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

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.entry_insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.weekly_insight_patterns ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.progress_insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

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

-- Sequences (needed for uuid generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

