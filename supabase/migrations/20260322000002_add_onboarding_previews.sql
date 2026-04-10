CREATE TABLE onboarding_previews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    pattern JSONB NOT NULL,
    progress JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE onboarding_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own onboarding preview"
    ON onboarding_previews FOR SELECT
    USING (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "users can insert own onboarding preview"
    ON onboarding_previews FOR INSERT
    WITH CHECK (user_id = (auth.jwt()->>'sub'));
