-- UNS-358: Link journal entries back to their reflection source
-- source_type: 'pattern' | 'progress'  (text, no enum — easier to extend later)
-- source_id:   uuid of the pattern or progress insight row
-- No FK constraint: polymorphic source — source_id can point to two different tables.
-- RLS already scopes all SELECT/INSERT/UPDATE to the authenticated user.

ALTER TABLE public.entries
    ADD COLUMN source_type text,
    ADD COLUMN source_id   uuid;

-- Partial index for getEntriesBySource queries: fast lookup by (source_type, source_id).
-- Only indexes rows that have a source, keeping the index small.
CREATE INDEX entries_source_idx
    ON public.entries (source_type, source_id)
    WHERE source_id IS NOT NULL;
