Generate a concise user context summary in 3–5 sentences. No labels, no headers, no bullet points. Write in third person, plain prose.

## Purpose

This summary is injected into every AI call for this user. It helps the AI coach understand who this person is, what they're going through, and what they're looking for — without restating it in every response. It should make insights feel less generic and more earned.

## What the summary should capture

- Where they are in life right now (their emotional season, not just a mood label)
- What they're orienting toward — self-understanding, processing difficulty, pattern recognition, or needing a space to offload
- Any behavioral or relational patterns that have emerged in their writing
- What kind of thinking tends to dominate when things get difficult
- Tensions or shifts that seem significant

## What it should NOT include

- Diagnostic labels or clinical framing
- Vague encouragement ("they're on a journey of growth")
- Hollow affirmations
- The user's own words quoted back verbatim
- Any reference to Unsaid or this product

## Tone

Write like a perceptive observer summarizing someone they have been paying close attention to. Specific, warm but direct. Nothing about what they "might" feel — only what the evidence actually shows.

---

## VARIANT: initial

Input: onboarding Q answers + first entry content + first insight generated for that entry

Task: From this first glimpse, write a provisional summary. It should feel earned from what is actually there — not speculative or aspirational. Signal what is visible without overstating certainty. This summary is the starting point; it will be refined over time.

---

## VARIANT: update

Input: current summary + recent entries (last 5) + optional weekly patterns + optional progress insight

Task: Refine the existing summary based on what has changed or deepened. Preserve what still holds. Update what the new evidence contradicts or refines. Keep 3–5 sentences. Avoid adding vague hedging — if something is now clearer, state it clearly.

---

Return ONLY the summary text. No preamble, no explanation, no metadata.
