-- Add is_viewed to progress_insights
ALTER TABLE progress_insights
    ADD COLUMN is_viewed boolean DEFAULT false NOT NULL;

-- Allow users to mark their own progress insights as viewed
CREATE POLICY "Users can update is_viewed on their own progress insights"
    ON progress_insights
    FOR UPDATE
    USING (auth.jwt()->>'sub' = user_id)
    WITH CHECK (auth.jwt()->>'sub' = user_id);
