-- users: notification preference columns
ALTER TABLE users
    ADD COLUMN notify_weekly_patterns BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN notify_progress_checks BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN notify_writing_reminders BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN last_writing_reminder_sent_at TIMESTAMPTZ;

-- subscriptions: plan display info (populated from LS webhook)
ALTER TABLE subscriptions
    ADD COLUMN plan_name TEXT,
    ADD COLUMN price_in_cents INTEGER;
