CRITICAL: Pick ONE core insight—the single most important pattern across these 15 entries. Every section must build on this ONE throughline. Do not scatter across multiple unrelated observations.

Output ONLY a valid JSON object with these exact fields. No markdown, no code fences, no text before or after the JSON:

{
  "headline": "One punchy sentence that names the core insight. Are they stuck, progressing, or regressing? This sets the thesis.",
  "whats_on_repeat": "2-3 sentences max. Evidence for the headline. Quote them directly—use their actual words in \"quotes\". Don't introduce new patterns here.",
  "what_changed": "1-2 sentences. Real progress, even tiny. Connect it to the headline. If nothing changed: \"Nothing's shifted yet.\"",
  "reality_check": "1-2 sentences. Name the GAP between progress made and where they're still stuck. Deepen the headline—don't repeat it.",
  "experiment": "ONE specific action. Not advice—an experiment. Something they could do THIS WEEK. Concrete and small.",
  "the_question": "One question that surfaces WHY the gap exists. Points to the blind spot underneath the pattern. Should sting a little.",
  "key_entry_numbers": [3, 7, 12]
}

The key_entry_numbers field: include 3–5 of the 15 recent entries (1-indexed, where Entry 1 is the most recent) that you quoted or drew insight from most directly.

ENTRY INSIGHT META-LAYER:
Each recent entry has an AI-generated insight summary and tags. Use these as a lens—they surface what was emotionally significant per entry. Let them enrich your analysis without replacing the raw entry content.

NARRATIVE FLOW:
headline (thesis) → whats_on_repeat (evidence) → what_changed (momentum) → reality_check (the gap) → experiment (bridge the gap) → the_question (the deeper why)

Each field builds on the previous. No field should feel disconnected or introduce something not set up earlier.

CONSTRAINTS:
- Total word count across all content fields: 150-200 words MAX
- Use 3+ direct quotes from their entries (in "quote marks")
- ONE throughline, ONE core insight—don't scatter
- No repeating the same observation across fields—each adds a new layer
- No fluff phrases like "It's worth noting" or "You might consider"
- Every sentence must earn its place
- Write like you're talking directly to someone — no report voice, no distance
- When referencing a specific entry in text, use its date (e.g., "on Mar 3") — never use entry numbers or IDs

TONE: 70% direct, 30% encouraging. Like a coach who believes in them but won't coddle them.

---

### Example

**Input:**
User: Alex
Recent 15 entries (Entry 1 = most recent): [15 entries about work stress, saying yes, boundaries]
Related past entries: [3 entries from 2 months ago with same themes]

**Expected Output:**
{
  "headline": "You've mastered the language of boundaries but haven't actually used one yet.",
  "whats_on_repeat": "\"I need to set boundaries\" appears in 6 entries. \"I said yes again\" in 4. You've diagnosed the problem perfectly—you even wrote \"I don't understand why I can't just say no.\" But knowing isn't doing.",
  "what_changed": "Your inner voice softened. Around Jan 12, the harsh self-criticism shifted to curiosity—you started asking \"why\" instead of \"what's wrong with me.\" That self-compassion is the foundation you'll need.",
  "reality_check": "But here's the gap: you're kinder to yourself about failing to set boundaries, which makes it easier to keep failing. The softer voice hasn't translated to a firmer \"no.\"",
  "experiment": "This week: say \"Let me check my calendar and get back to you\" to ONE request. Don't say yes or no immediately. Just pause.",
  "the_question": "What's scarier—being seen as someone with limits, or staying comfortable in the cycle you've learned to forgive yourself for?",
  "key_entry_numbers": [2, 5, 8, 11]
}
