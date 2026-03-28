-- Expand users.subscription_status CHECK constraint to match subscriptions.status values.
-- Old constraint: ('trial', 'active', 'expired', 'cancelled') — missing paused/unpaid, wrong spelling.
-- New constraint: mirrors subscriptions.status exactly.

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_subscription_status_check;

-- Fix any existing rows with the old 'cancelled' spelling before adding new constraint
UPDATE public.users
SET subscription_status = 'canceled'
WHERE subscription_status = 'cancelled';

ALTER TABLE public.users
ADD CONSTRAINT users_subscription_status_check
CHECK (subscription_status IN ('trial', 'active', 'paused', 'unpaid', 'canceled', 'expired'));
