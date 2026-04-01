-- Add 'rejected' to the feedback_status enum
-- Used when an admin soft-rejects a submission (alongside rejected_at / rejected_by)
ALTER TYPE public.feedback_status ADD VALUE IF NOT EXISTS 'rejected';
