Analyze these journal entries and generate 1-3 insight cards. Each card reveals a pattern the user likely can't see on their own.

## Card Categories

Each insight card must be categorized. Choose ONE category per card:

- **theme**: A topic or subject that appears across multiple entries
  Example: "Work-life balance", "Family relationships"

- **trigger**: Something that consistently causes an emotional response
  Example: "Criticism from authority figures triggers defensiveness"

- **thought_pattern**: A recurring way of thinking or interpreting events
  Example: "Assuming the worst outcome", "All-or-nothing thinking"

- **avoidance**: Something you consistently avoid or postpone
  Example: "Avoiding difficult conversations", "Postponing health decisions"

- **habit**: A repeated behavior, positive or negative
  Example: "Late-night overthinking", "Sunday meal prep"

- **need**: An underlying need that surfaces across entries
  Example: "Need for validation", "Need for autonomy"

- **growth**: Evidence of positive change or progress
  Example: "Handling conflict better than last month"

## Insight Card Structure

For each card provide:

1. **title**: A specific, non-judgmental name (e.g., "Sunday Anxiety Loop" not "Stress")
2. **pattern_type**: One category from above
3. **description**: 3-4 sentences explaining:
   - What the pattern is (be specific, reference their words)
   - Why it matters (what it reveals about them)
   - What might be underneath it (hypothesis, not diagnosis)
4. **evidence**: Array of entry IDs where this pattern appears (minimum 2)
5. **question**: A thoughtful follow-up question (optional)
6. **suggested_experiment**: A small action to test a hypothesis about this pattern (optional)

## Prioritize Cards That

- Appear in 2+ entries
- Reveal something the user hasn't explicitly stated
- Show emotional or behavioral patterns (not just topic clustering)
- Could lead to actionable insight or self-awareness

## Output Format

Return ONLY a valid JSON array. No preamble, no explanation, no markdown code blocks.

```json
[
  {
    "title": "string",
    "pattern_type": "theme|trigger|thought_pattern|avoidance|habit|need|growth",
    "description": "string",
    "evidence": ["entry_id_1", "entry_id_2"],
    "question": "string (optional)",
    "suggested_experiment": "string (optional)"
  }
]
```

## Example

**Input:**
```
[abc123, Mon] Had a rough day at work. Manager piled on more tasks.
[def456, Wed] Stayed late again. Didn't want to disappoint the team.
[ghi789, Fri] Finally said no to an extra project. Felt guilty but relieved.
[jkl012, Sun] Dreading Monday. What if they think I'm not committed?
```

**Output:**
```json
[
  {
    "title": "The Permission to Say No",
    "pattern_type": "growth",
    "description": "You're learning to set boundaries at work, but guilt follows. Friday's 'no' was a breakthrough - you felt 'relieved' even while 'guilty'. The Sunday dread suggests you're still seeking external permission to prioritize yourself.",
    "evidence": ["ghi789", "jkl012"],
    "question": "What would it take to feel okay about saying no without waiting for guilt to pass?",
    "suggested_experiment": "This week, say no to one small request and notice: does the guilt shrink faster than you expect?"
  },
  {
    "title": "Commitment as Identity",
    "pattern_type": "need",
    "description": "Being seen as 'committed' matters deeply to you. You stayed late to not 'disappoint' and worry they'll think you're 'not committed'. This need for external validation of your work ethic is driving overwork.",
    "evidence": ["def456", "jkl012"],
    "question": "If no one at work ever praised your commitment again, how would you know you're doing enough?"
  }
]
```

---

ENTRIES TO ANALYZE:
