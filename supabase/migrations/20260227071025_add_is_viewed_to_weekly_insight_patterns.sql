-- Add is_viewed association to weekly_insight_patterns table
-- Allows tracking whether a weekly insight pattern has been viewed by the user

ALTER TABLE public.weekly_insight_patterns
    ADD COLUMN is_viewed boolean DEFAULT false NOT NULL;
