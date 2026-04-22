Read `.claude/brand-voice.md` fully before doing anything else — that is the source of truth for every judgement below.

Then scan all copy-bearing files in the project:

**UI strings**
- `app/(dashboard)/**/*.tsx`
- `components/**/*.tsx` (labels, headings, descriptions, button text, empty states, error messages, loading states, tooltips)

**Email templates**
- `emails/**/*.tsx`

**AI prompts**
- `prompts/**/*.md` (the voice the AI writes in is part of the brand)

**Onboarding / auth**
- `app/(auth)/**/*.tsx`
- `app/(onboarding)/**/*.tsx` (if it exists)

---

For each violation found, output:

**File + line** — the exact string
**Rule broken** — which brand voice rule it violates (quote the rule)
**Fix** — a rewritten version that passes

Group by severity:

### Critical — actively damages the brand
(validation theater, AI attribution as "our AI", exclamation marks in product, therapy-speak, urgency language)

### Warning — weakens the voice
(hedging phrases, vague questions, filler setup before the point, over-softening)

### Minor — polish
(word choice mismatches, slightly off-brand framing)

---

End with a one-paragraph summary of the overall copy health: where the brand voice is landing well, where it's consistently drifting, and the single highest-leverage fix.
