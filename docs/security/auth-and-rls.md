# Auth and RLS

## Auth Flow (Clerk)

1. User signs in via Clerk (`app/(auth)/sign-in/`)
2. Clerk issues a JWT with `sub` = Clerk `userId` (e.g. `user_abc123`)
3. Clerk middleware (`middleware.ts` at repo root) runs on every request — handles session refresh and public/protected route split
4. Every API route and server action calls `auth()` from `@clerk/nextjs/server`:

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

5. The `userId` is the Clerk user ID — it matches `users.user_id` in Supabase

**`lib/supabase/middleware.ts`** — creates a Supabase service role client for middleware-level checks (e.g. user existence during sync). Not used for user data access.

---

## RLS — How It Works

Supabase RLS policies filter rows using the Clerk JWT claim:

```sql
-- Example RLS policy on entries
auth.jwt()->>'sub' = user_id
```

This means:
- The Clerk `userId` in the JWT = the `user_id` column in every table
- Queries automatically scope to the current user — no manual `.eq('user_id', userId)` needed
- If a user tries to access another user's data, RLS returns empty (not an error)

**When queries return empty unexpectedly** — check RLS before debugging the query. Common causes:
- Service role client used where anon client was expected (bypasses RLS)
- JWT not forwarded correctly to Supabase client

---

## Supabase Client Types

Three clients, three purposes:

| Client | File | Key | RLS |
|--------|------|-----|-----|
| User client | `lib/supabase/client.ts` | Anon key | Enforced |
| Server client | `lib/supabase/server.ts` | Anon key + Clerk JWT | Enforced |
| Admin client | `lib/supabase/admin.ts` | Service role key | **Bypassed** |

The **admin client** (`lib/supabase/admin.ts`) bypasses RLS entirely. It is used only in:
- Cron jobs (`app/api/cron/`)
- Webhook handlers (`app/api/webhooks/`)
- Admin routes (`app/(dashboard)/backstage/`)

**Never use the admin client in user-facing flows.**

---

## Encryption at Rest

Algorithm: **AES-256-GCM** implemented in `lib/crypto.ts`.

```typescript
encrypt(plaintext: string): { encryptedContent: string, iv: string, tag: string }
decrypt({ encryptedContent, iv, tag }): string
```

**Encrypted fields:**

| Table | Encrypted columns |
|-------|-------------------|
| `entries` | `encrypted_content`, `content_iv`, `content_tag` |
| `entry_insights` | `encrypted_content`, `content_iv`, `content_tag` |
| `weekly_insight_patterns` | `encrypted_description`, `description_iv`, `description_tag` + question + suggested_experiment (same pattern) |
| `progress_insights` | `encrypted_content`, `content_iv`, `content_tag` |

**Decryption happens only in transformers** (`lib/[domain]/transformers.ts`). Repos return raw encrypted rows. Services never touch encryption — they call transformers after repos.

The encryption key is stored in `ENCRYPTION_KEY` environment variable. Never log it, never expose it in responses.

---

## Cron Job Auth

All cron routes call `validateCronRequest()` from `lib/cron/auth.ts`.
The helper uses `CRON_SECRET` with timing-safe comparison to prevent timing
attacks:

```typescript
const authError = validateCronRequest(req, "weekly-insights");
if (authError) return authError;
```

- Missing `CRON_SECRET` returns 500 (server misconfiguration), not 401, and is reported to Sentry
- Invalid or missing bearer auth returns 401 and logs a warning without creating a Sentry issue
- Cron routes are called by Vercel's cron scheduler using the secret from environment variables

---

## Webhook Auth

- **Lemon Squeezy:** validates `X-Signature` header using HMAC-SHA256 with `LEMON_SQUEEZY_WEBHOOK_SECRET`
- **Clerk:** validates using Clerk's webhook verification SDK

Both check idempotency before processing:
- Lemon Squeezy: checks `payment_events.lemon_event_id` for duplicates
- Clerk: uses Clerk's built-in deduplication

---

## Clerk Admin Client (`lib/auth/admin.ts`)

Used for server-side Clerk operations (fetching users, managing accounts). Only used in:
- Account deletion flow (`lib/users/service.ts` → `processExpiredDeletions()`)
- Admin backstage routes

Never exposed to user-facing flows.

---

## Sensitive Files

Modifying these requires an explicit reason:

| File | Risk |
|------|------|
| `lib/crypto.ts` | Change here could make existing encrypted data unreadable |
| `lib/supabase/admin.ts` | Service role key — bypasses all RLS |
| `lib/auth/admin.ts` | Clerk admin — can delete/modify any user |
| `supabase/migrations/` | Schema changes are irreversible in production |
