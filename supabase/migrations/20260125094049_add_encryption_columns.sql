-- ENTRIES TABLE
ALTER TABLE entries
    ADD COLUMN encrypted_content text,
    ADD COLUMN content_iv text,
    ADD COLUMN content_tag text;

-- ENTRIES_INSIGHTS TABLE
ALTER TABLE entry_insights
    ADD COLUMN encrypted_content text,
    ADD COLUMN content_iv text,
    ADD COLUMN content_tag text;

-- WEEKLY_INSIGHT_PATTERNS TABLE
ALTER TABLE weekly_insight_patterns
    ADD COLUMN encrypted_description text,
    ADD COLUMN description_iv text,
    ADD COLUMN description_tag text,
    ADD COLUMN encrypted_question text,
    ADD COLUMN question_iv text,
    ADD COLUMN question_tag text,
    ADD COLUMN encrypted_suggested_experiment text,
    ADD COLUMN suggested_experiment_iv text,
    ADD COLUMN suggested_experiment_tag text;

-- PROGRESS_INSIGHTS TABLE
ALTER TABLE progress_insights
    ADD COLUMN encrypted_content text,
    ADD COLUMN content_iv text,
    ADD COLUMN content_tag text;

-- Add constraints to ensure encryption completeness
ALTER TABLE entries
    ADD CONSTRAINT entries_encryption_complete CHECK (encrypted_content IS NOT NULL AND content_iv IS NOT NULL AND content_tag IS NOT NULL);

ALTER TABLE entry_insights
    ADD CONSTRAINT entry_insights_encryption_complete CHECK (encrypted_content IS NOT NULL AND content_iv IS NOT NULL AND content_tag IS NOT NULL);

ALTER TABLE weekly_insight_patterns
    ADD CONSTRAINT weekly_insight_patterns_description_encryption_complete CHECK (encrypted_description IS NOT NULL AND description_iv IS NOT NULL AND description_tag IS NOT NULL);

ALTER TABLE weekly_insight_patterns
    ADD CONSTRAINT weekly_insight_patterns_question_encryption_complete CHECK (encrypted_question IS NOT NULL AND question_iv IS NOT NULL AND question_tag IS NOT NULL);

ALTER TABLE weekly_insight_patterns
    ADD CONSTRAINT weekly_insight_patterns_suggested_experiment_encryption_complete CHECK (encrypted_suggested_experiment IS NOT NULL AND suggested_experiment_iv IS NOT NULL AND suggested_experiment_tag IS NOT NULL);

ALTER TABLE progress_insights
    ADD CONSTRAINT progress_insights_encryption_complete CHECK (encrypted_content IS NOT NULL AND content_iv IS NOT NULL AND content_tag IS NOT NULL);

-- Drop old plaintext columns
ALTER TABLE entries
    DROP COLUMN content;

ALTER TABLE entry_insights
    DROP COLUMN content;

ALTER TABLE weekly_insight_patterns
    DROP COLUMN description,
    DROP COLUMN question,
    DROP COLUMN suggested_experiment;

ALTER TABLE progress_insights
    DROP COLUMN content;

