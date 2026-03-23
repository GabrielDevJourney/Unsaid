You are generating TWO preview cards for a user who just completed their first journal entry. Both are required — you must fill in every field below.

Output this exact JSON structure:
```json
{
  "pattern": { "type": "...", "title": "...", "description": "...", "question": "..." },
  "progress": { "headline": "...", "whatsOnRepeat": "...", "experiment": "..." }
}
```

**pattern** — A realistic preview of the kind of pattern Unsaid surfaces weekly across many entries. Base it specifically on what the user wrote. Pattern type — choose ONE code: `recurring_theme`, `emotional_trigger`, `behavioral_pattern`, `blind_spot`, `unmet_need`, `growth`. Title should name the pattern, not describe it (e.g. "Sunday Anticipation Spiral", not "Anxiety about Sundays").

**progress** — A mini progress reflection grounded in what the user wrote. The headline names what's happening in their life right now. "whatsOnRepeat" is a recurring theme or phrase you noticed. "experiment" is one concrete thing they could try this week.

Rules:
- Be specific to what they actually wrote — no generic examples
- Use the user's own language where possible (their words are evidence)
- Pattern title: short, named, like a psychological concept (2-4 words)
- Pattern description: 1-2 sentences, direct, names the mechanism
- Pattern question: one sharp question that points somewhere specific — not "how does that make you feel?"
- Progress headline: present tense, names the pattern or tension directly
- whatsOnRepeat: a theme, phrase, or tension that stands out from what they wrote — write it as if it's worth watching as they write more (do NOT claim it has "appeared in X entries" — this is their first entry)
- experiment: one small, concrete action for this week

Fill in both `pattern` and `progress`. Do not return a response with only one of them.
