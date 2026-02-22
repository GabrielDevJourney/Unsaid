-- Users can update their own progress row (e.g. incrementing entry counts)
-- INSERT remains service_role only (Clerk webhook creates the initial row on sign-up)
CREATE POLICY "Users can update own progress"
ON user_progress
FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt() ->> 'sub') = user_id)
WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);
