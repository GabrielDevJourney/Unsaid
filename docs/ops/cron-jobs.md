# Cron Jobs

All cron jobs live in `app/api/cron/`. Scheduled in `vercel.json`.
Protected by `CRON_SECRET` Bearer token through `validateCronRequest()` in
`lib/cron/auth.ts`.

---

## Jobs

### `weekly-insights` — Weekly
**Route:** `app/api/cron/weekly-insights/route.ts`  
**Schedule:** Every Sunday 9pm (configured in `vercel.json`)  
**Delegates to:** `processWeeklyInsightsForAllUsers()` in `lib/weekly-insights/service.ts`  
**What it does:** Fetches all users who wrote 2+ entries in the past week (`MIN_ENTRIES_FOR_WEEKLY_INSIGHT = 2`), runs Tier 2 pattern analysis for each, stores results in `weekly_insights` + `weekly_insight_patterns`, sends email notification.

### `trial-reminder` — Daily
**Route:** `app/api/cron/trial-reminder/route.ts`  
**Delegates to:** `getExpiringTrials(supabase, 3)` from `lib/subscriptions/service.ts` → `sendTrialEndingEmail()` from `lib/email/service.ts`  
**What it does:** Finds users whose trial ends in exactly 3 days (`DAYS_BEFORE_EXPIRY = 3`) and sends a trial ending email.

### `writing-reminders` — Daily
**Route:** `app/api/cron/writing-reminders/route.ts`  
**Delegates to:** `getUsersOptedIntoWritingReminders()` from `lib/users/service.ts` → `sendWritingReminderEmail()` from `lib/email/service.ts`  
**What it does:** Targets users with all of: `notify_writing_reminders = true`, `subscription_status` = `active` or `trial`, no entry in last 3 days (`INACTIVITY_DAYS = 3`), last reminder sent 7+ days ago (`COOLDOWN_DAYS = 7`). Sends re-engagement email and updates `last_writing_reminder_sent_at`.

### `account-deletion` — Daily
**Route:** `app/api/cron/account-deletion/route.ts`  
**Delegates to:** `processExpiredDeletions()` in `lib/users/service.ts`  
**What it does:** Hard-deletes accounts whose 30-day grace period has expired (`deleted_at + 30 days < now()`). Deletes Supabase data first (CASCADE handles related tables), then deletes Clerk account via admin client.

---

## Auth Pattern (all routes)

```typescript
const authError = validateCronRequest(req, "weekly-insights");
if (authError) return authError;
```

Missing `CRON_SECRET` → 500 (not 401) and Sentry capture. Invalid/missing
bearer auth → 401 and a server warning. This keeps misconfiguration loud while
avoiding Sentry noise from public probes.

---

## Testing Locally

All cron routes are standard `GET` endpoints. To test locally:

```bash
curl -H "Authorization: Bearer <your-CRON_SECRET>" http://localhost:3000/api/cron/weekly-insights
```

See `docs/local-testing.md` for full environment setup.

---

## Adding a New Cron Job

1. Create `app/api/cron/[name]/route.ts` and call `validateCronRequest(req, "<job-name>")`
2. Add the schedule to `vercel.json` under `crons`
3. Delegate to a service function — no business logic in the route handler
4. Add an entry to this doc
