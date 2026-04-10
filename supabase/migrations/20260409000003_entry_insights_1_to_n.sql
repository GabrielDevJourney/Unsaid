-- Move entry_insights from 1:1 to 1:N per entry.
-- Each insight generation is now a separate row, enabling correct segment
-- reconstruction on page reload (text | insight | text order).
--
-- generation_order: open integer, no hardcoded max, replaces insight_count
-- content_before_length: char index in combined entry content at generation time,
--   used to split content back into segments on reload

-- 1. Drop the unique constraint that enforced one insight per entry
ALTER TABLE entry_insights DROP CONSTRAINT IF EXISTS entry_insights_entry_id_key;

-- 2. Add generation_order — open integer, no enum, no hardcoded limit
ALTER TABLE entry_insights ADD COLUMN IF NOT EXISTS generation_order INTEGER NOT NULL DEFAULT 1;

-- 3. Add content split point for editor segment reconstruction
ALTER TABLE entry_insights ADD COLUMN IF NOT EXISTS content_before_length INTEGER;

-- 4. Drop insight_count — generation_order replaces it entirely
ALTER TABLE entry_insights DROP COLUMN IF EXISTS insight_count;

-- 5. Index for efficient "latest insight per entry" reads
--    (home page, patterns, progress — always pick the highest generation_order)
CREATE INDEX IF NOT EXISTS idx_entry_insights_entry_order
    ON entry_insights(entry_id, generation_order DESC);
