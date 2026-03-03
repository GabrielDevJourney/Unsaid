ALTER TABLE weekly_insight_patterns
    DROP CONSTRAINT IF EXISTS weekly_insight_patterns_pattern_type_check;

ALTER TABLE weekly_insight_patterns
    ADD CONSTRAINT weekly_insight_patterns_pattern_type_check CHECK (pattern_type IN ('reccurring_theme', 'emotional_trigger', 'behavioral_pattern', 'blind_spot', 'unmet_need', 'growth'))
