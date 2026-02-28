-- Add entry_id association to prompts table
-- Allows a generated prompt to be linked to the entry it was used for

ALTER TABLE public.prompts
    ADD COLUMN entry_id uuid REFERENCES public.entries(id) ON DELETE CASCADE;

CREATE INDEX prompts_entry_idx ON public.prompts(entry_id)
    WHERE entry_id IS NOT NULL;

-- INSERT was missing from initial schema — users need to create their own prompts
CREATE POLICY "Users can create own prompts" ON public.prompts
    FOR INSERT
    WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

GRANT INSERT ON public.prompts TO authenticated;
