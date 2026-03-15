-- Fix typo: 'reccurring_theme' → 'recurring_theme' in weekly_insight_patterns.pattern_type
-- The DB constraint had a double-c typo that didn't match the TS PatternTypeCode enum.

-- Drop constraint first (it rejects the correct spelling), then fix rows, then re-add.
ALTER TABLE weekly_insight_patterns
    DROP CONSTRAINT weekly_insight_patterns_pattern_type_check;

UPDATE weekly_insight_patterns
SET pattern_type = 'recurring_theme'
WHERE pattern_type = 'reccurring_theme';

ALTER TABLE weekly_insight_patterns
    ADD CONSTRAINT weekly_insight_patterns_pattern_type_check
    CHECK (pattern_type IN ('recurring_theme', 'emotional_trigger', 'behavioral_pattern', 'blind_spot', 'unmet_need', 'growth'));
