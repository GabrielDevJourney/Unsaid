---
name: bug-triage
description: Systematic diagnosis for Unsaid bugs. Use when debugging any error — client crash, server error, AI pipeline issue, or data/RLS problem. Follows a 7-step flow: classify → find entry point → trace call stack → check RLS → check entitlements → check AI pipeline → write root cause sentence before proposing a fix.
---

# Bug Triage

Systematic diagnosis for Unsaid. Follow in order — don't skip to fixes.

---

## Step 1: Classify

What kind of error is it?
- **Client error** — JS exception, render crash, state issue
- **Server error** — API route 4xx/5xx, server action failure
- **AI pipeline error** — missing insight, wrong format, streaming issue
- **Data error** — wrong data, missing data, RLS block

Check Sentry first for the full error event and stack trace before reading code.

## Step 2: Find the Entry Point

Where does the user action enter the system?
- API route: `app/api/[domain]/route.ts`
- Server action: `app/actions/[domain].ts`
- Cron: `app/api/cron/[name]/route.ts`
- Client-side: component in `components/[domain]/`

## Step 3: Trace the Call Stack

Follow the actual path — don't guess:

```
Entry point → service (lib/[domain]/service.ts) → repo (lib/[domain]/repo.ts) → Supabase
```

Read each function in sequence. Find where the data diverges from expected.

## Step 4: Data Access Issues

If data is missing or returns empty:
- Is RLS blocking it? Check the policy — `auth.jwt()->>'sub'` must match `user_id`
- Is the correct Supabase client being used? Admin client bypasses RLS — user-facing code should use server/anon client
- Is the Clerk `userId` being passed correctly through the request?

## Step 5: Subscription-Gated Features

If a feature is not accessible:
- Check `canUserWriteEntry()` in `lib/subscriptions/entitlements.ts`
- Check `subscription_status` in `users` table
- Check `trial_ends_at` — is the trial still valid?

## Step 6: AI Pipeline Issues

| Symptom | Where to check |
|---------|----------------|
| Insight not generating | `app/api/entry-insights/route.ts` → `lib/ai/stream-entry-insight.ts` |
| Insight stored but empty | `lib/schemas/entry-insight.ts` Zod validation — did parse fail silently? |
| Wrong insight format | `prompts/tasks/entry.md` — was the prompt changed? |
| Weekly patterns missing | `lib/weekly-insights/service.ts` → check `MIN_ENTRIES_FOR_WEEKLY_INSIGHT` threshold |
| Progress not triggering | `lib/triggers/check-progress-trigger.ts` → check `PROGRESS_TRIGGER_INTERVAL` and `user_progress.total_entries` |
| Streaming broken | Check `streamText` + `Output.object()` + `smoothStream` config in `lib/ai/stream-entry-insight.ts` |

## Step 7: Write the Root Cause

Before proposing a fix, write one sentence:

> "The bug is X because Y."

If you can't write this sentence, you haven't found the root cause yet. Keep tracing.
