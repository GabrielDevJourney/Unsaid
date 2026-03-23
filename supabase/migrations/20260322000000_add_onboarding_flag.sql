ALTER TABLE user_progress
    ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean NOT NULL DEFAULT false;
