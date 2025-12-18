-- RLS uses auth.jwt()->>'sub' which contains the Clerk user ID.
-- All policies use (SELECT auth.jwt()) for performance (evaluated once per query).
-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- =============================================================================
-- TABLES
-- =============================================================================
-- USERS TABLE
CREATE TABLE public.users(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text UNIQUE NOT NULL,
    email text NOT NULL,
    subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    trial_started_at timestamptz DEFAULT now(),
    trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
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

-- INSIGHTS TABLE
CREATE TABLE public.insights(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    entry_id uuid REFERENCES public.entries(id) ON DELETE CASCADE,
    tier integer NOT NULL CHECK (tier IN (1, 2, 3)),
    content jsonb NOT NULL,
    related_entry_ids uuid[] DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX insights_user_tier_idx ON public.insights(user_id, tier, created_at DESC);

CREATE INDEX insights_entry_id_idx ON public.insights(entry_id)
WHERE
    entry_id IS NOT NULL;

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
    entry_count_at_last_tier3 integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- TRIGGERS: Auto-update updated_at
-- =============================================================================
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

CREATE TRIGGER insights_updated_at
    BEFORE UPDATE ON public.insights
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

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- USERS policies
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

-- INSIGHTS policies (read-only for users, created by system)
CREATE POLICY "Users can view own insights" ON public.insights
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
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT
        USING ((
            SELECT
                auth.jwt() ->> 'sub') = user_id);

-- =============================================================================
-- GRANTS: API Access for PostgREST
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Users table
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Entries table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;

-- Insights table (read-only)
GRANT SELECT ON public.insights TO authenticated;

-- Prompts table
GRANT SELECT, UPDATE ON public.prompts TO authenticated;

-- User progress table (read-only)
GRANT SELECT ON public.user_progress TO authenticated;

-- Sequences (needed for uuid generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

