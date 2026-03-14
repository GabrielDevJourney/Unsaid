-- Add key_entry_ids column to progress_insights
-- Stores the 3-5 entry IDs that the AI most referenced in the insight.
-- NULL for old records (text-format content) — UI falls back gracefully.
ALTER TABLE progress_insights
    ADD COLUMN key_entry_ids text[] DEFAULT NULL;
