-- Expand subscriptions.status CHECK constraint to include all Lemon Squeezy statuses.
-- Previously missing: 'paused' and 'unpaid'.

ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('trial', 'active', 'paused', 'unpaid', 'canceled', 'expired'));
