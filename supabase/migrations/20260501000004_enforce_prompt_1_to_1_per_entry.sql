-- Enforce a single saved prompt per entry.
-- Prompts are intentionally persisted even if not explicitly "used", but an
-- entry should only ever have one canonical prompt row.

WITH ranked_prompts AS (
    SELECT
        id,
        entry_id,
        ROW_NUMBER() OVER (
            PARTITION BY entry_id
            ORDER BY created_at DESC, id DESC
        ) AS row_num
    FROM public.prompts
    WHERE entry_id IS NOT NULL
)
DELETE FROM public.prompts p
USING ranked_prompts rp
WHERE p.id = rp.id
  AND rp.row_num > 1;

DROP INDEX IF EXISTS prompts_entry_idx;

CREATE UNIQUE INDEX prompts_entry_unique_idx
    ON public.prompts(entry_id)
    WHERE entry_id IS NOT NULL;
