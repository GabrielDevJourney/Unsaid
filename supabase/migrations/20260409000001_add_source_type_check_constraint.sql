-- Harden source_type: reject any value not in the known set.
-- Using a CHECK constraint rather than an enum so new source types can be added
-- by dropping and re-adding this constraint — without the permanent enum value limitation.

ALTER TABLE public.entries
    ADD CONSTRAINT entries_source_type_check
    CHECK (source_type IN ('pattern', 'progress'));
