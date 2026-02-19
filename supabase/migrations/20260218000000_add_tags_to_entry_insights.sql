ALTER TABLE entry_insights
    ADD COLUMN tags text[] NOT NULL DEFAULT '{}'::text[];
