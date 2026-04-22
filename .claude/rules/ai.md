# AI Pipeline Rules

## The 3-Tier Architecture

All AI logic lives in `lib/ai/`. Prompts live in `prompts/`. Schemas live in `lib/schemas/`. Never inline prompts in code.

---

### Tier 1 — Entry Insight (Immediate)

- **File:** `lib/ai/stream-entry-insight.ts`
- **Function:** `streamEntryInsight(entryContent, options?)`
- **Model:** `claude-haiku-4-5` (default) / `claude-sonnet-4-6` (when `reflectionContext` present)
- **Trigger:** After every entry save, via `app/api/entry-insights/`
- **Output schema:** `lib/schemas/entry-insight.ts` — `{ insight: string, tags: enum[] (max 3) }`
- **Streaming:** `streamText` + `experimental_output: Output.object({ schema })` + `experimental_transform: smoothStream({ chunking: 'word', delayInMs: 20 })`
- **Client consumption:** `experimental_useObject as useObject` from `@ai-sdk/react`
- **Cost:** ~$0.0008/entry

### Tier 2 — Weekly Patterns (Cron)

- **File:** `lib/ai/generate-weekly-insight.ts`
- **Function:** `generateWeeklyInsight(entries: EntryForAnalysis[]): Promise<Pattern[]>`
- **Model:** `claude-sonnet-4-6`
- **Trigger:** Sunday 9pm cron → `app/api/cron/weekly-insights/` → `processWeeklyInsightsForAllUsers()`
- **Minimum entries:** 2 (constant: `MIN_ENTRIES_FOR_WEEKLY_INSIGHT` in `lib/constants.ts`)
- **Output schema:** `lib/schemas/weekly-insight.ts` — `Pattern[]` (title, pattern_type, description, evidence[], question?, suggested_experiment?)
- **Cost:** ~$0.084/analysis

### Tier 3 — Progress Check (Milestone)

- **File:** `lib/ai/generate-progress-insight.ts`
- **Function:** `generateProgressInsight(params: GenerateProgressInsightParams): Promise<ProgressInsightAIOutput | null>`
- **Model:** `claude-sonnet-4-6`
- **Trigger:** Every 15 entries (`PROGRESS_TRIGGER_INTERVAL` in `lib/constants.ts`) via `lib/triggers/check-progress-trigger.ts` → called from `createEntry()` in service
- **Input:** `{ recentEntries, relatedPastEntries?, entryInsights?, weeklyPatterns?, userName? }`
- **Output schema:** `lib/schemas/progress-insight.ts` — `{ headline, whats_on_repeat, what_changed, reality_check, experiment, the_question, key_entry_numbers[] }`
- **Semantic search:** related past entries fetched via `lib/semantic-search/service.ts`
- **Cost:** ~$0.10/analysis

---

## Prompts

- System prompt: `prompts/system.md` — shared context across all tiers
- Task prompts: `prompts/tasks/{entry,entry-theme,weekly,progress,onboarding-preview}.md`
- Loaded via: `lib/ai/prompts.ts` (in-memory cache, not DB)
- **Never write inline prompts in code** — all prompt text lives in `prompts/`
- Pattern types injected into prompts via `generatePatternTypesPromptSection()` from `lib/constants/pattern-types.ts`

---

## Output Validation

- All AI output is Zod-validated before storage — never store unvalidated AI text
- `onFinish` receives `{ text }` as raw JSON string — parse manually with `JSON.parse()`
- If schema validation fails, return empty/null (don't crash, don't store garbage)
- Embeddings: OpenAI `text-embedding-3-small` via `lib/ai/embeddings.ts`

---

## Cost Discipline

- State token/cost impact before modifying any AI call
- Tier 1 runs on every entry — model choice matters. Haiku for standard, Sonnet only when context demands it
- Tier 2 and 3 are cron/milestone — Sonnet is fine
- Cache embeddings when possible — regenerating is waste
- `docs/costs-overview.md` has the financial model — check it before adding new AI calls

---

## Adding or Modifying AI Behaviour

1. Start from the UI need, not the model capability
2. Write or update the Zod schema in `lib/schemas/` first
3. Write the task prompt in `prompts/tasks/`
4. Update `lib/ai/` function to call the model with the new prompt + schema
5. Update transformers if the DB shape changes
6. State cost estimate before implementing
