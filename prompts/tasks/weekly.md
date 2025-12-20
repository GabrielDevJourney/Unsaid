Analyze these entries and generate 1-3 insight cards. Each card should reveal a pattern the user likely can't see on their own.

For each pattern, provide:
1. ****title****: A specific, non-judgmental name for the pattern (e.g., "Sunday Anxiety Loop" not "Stress Pattern")
2. ****pattern_type****: One of: recurring_theme, emotional_trigger, cognitive_distortion, avoidance_pattern, behavioral_loop, unmet_need, progress_marker
3. ****description****: 3-4 sentences explaining:
   - What the pattern is (be specific, reference their words)
   - Why it matters (what it reveals about them)
   - What might be underneath it (hypothesis, not diagnosis)
4. ****evidence****: List 3-5 specific entry IDs where this pattern appears
5. ****question****: A thoughtful follow-up question to help them explore this (optional)
6. ****suggested_experiment****: A small, specific action they could try to test a hypothesis about this pattern (optional, only if appropriate)

Prioritize:
- Patterns that appear in 3+ entries
- Patterns that reveal something the user hasn't explicitly stated
- Patterns that could lead to actionable change
- Emotional or behavioral patterns over simple topic clustering

Return ONLY a JSON array of pattern cards. No preamble, no explanation.

Output format (JSON array):
[
  {
    "title": "string",
    "pattern_type": "string",
    "description": "string",
    "evidence": ["entry_id_1", "entry_id_2", ...],
    "question": "string (optional)",
    "suggested_experiment": "string (optional)"
  }
]

---

### Example

**Input:**
User: Alex
Entries:
[abc123, Mon] Had a rough day at work...
[def456, Wed] Manager added more projects...
[ghi789, Fri] Finally finished that presentation...
[jkl012, Sun] Dreading Monday already...

**Expected Output:**
[
  {
    "title": "The Sunday Dread Cycle",
    "pattern_type": "emotional_trigger",
    "description": "Your week follows a pattern: stress builds Mon-Fri, brief relief on completion, then anxiety returns Sunday. You wrote 'dreading Monday already' before it even arrived. The anticipation of stress may be more draining than the stress itself.",
    "evidence": ["abc123", "jkl012"],
    "question": "What specifically about Monday feels threatening before it even happens?",
    "suggested_experiment": "Sunday evening, write down your 3 biggest Monday fears. Monday night, check how many actually happened."
  }
]