CREATE TABLE public.rate_limit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scope text NOT NULL,
    key_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rate_limit_events_scope_key_created_idx
    ON public.rate_limit_events(scope, key_hash, created_at DESC);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage rate limit events"
    ON public.rate_limit_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

GRANT ALL ON public.rate_limit_events TO service_role;
