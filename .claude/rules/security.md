# Security Rules

## Auth Boundary — Clerk

Every API route and server action must validate the Clerk session:

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- Never trust client-provided user IDs
- Never skip the `auth()` check on protected routes
- `lib/supabase/middleware.ts` creates a Supabase service client for middleware-level user existence checks only

---

## RLS — Source of Truth for Data Access

- RLS policies on every user-scoped table — they filter by `auth.jwt()->>'sub'` (Clerk's `userId`)
- You do **not** need `.eq('user_id', userId)` in queries — RLS handles it automatically
- **Never use the service role client in user-facing flows** — it bypasses RLS entirely
- If a query returns no data and you think it should, check RLS before debugging the query

---

## Service Role Clients (Admin Only)

- `lib/auth/admin.ts` — Clerk admin client
- `lib/supabase/admin.ts` — Supabase service role client
- These bypass RLS. Use only in:
  - Cron jobs (`app/api/cron/`)
  - Webhook handlers (`app/api/webhooks/`)
  - Admin routes (`app/(dashboard)/backstage/`)
- **Never expose service role keys or admin clients to user-facing flows**

---

## Cron Job Auth

All cron routes validate `CRON_SECRET` with timing-safe comparison:

```typescript
const authHeader = req.headers.get("authorization");
const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;
crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader));
```

- No `CRON_SECRET` = 500 (not 401) — misconfiguration is a server error
- Webhook routes validate Lemon Squeezy and Clerk signatures — never skip signature verification

---

## Encryption at Rest

- Algorithm: AES-256-GCM (`lib/crypto.ts`)
- Encrypted fields (entry content): `encrypted_content`, `content_iv`, `content_tag`
- Same pattern for insight prose in `entry_insights` table
- **Decryption happens only in transformers** (`lib/[domain]/transformers.ts`) — never in repos or services
- `lib/crypto.ts` is a sensitive file — explain your reason before modifying it

---

## Sensitive Files

Always explain why before modifying these:
- `lib/crypto.ts` — encryption/decryption core
- `lib/supabase/admin.ts` — service role client
- `lib/auth/admin.ts` — Clerk admin client
- `supabase/migrations/` — schema changes are irreversible in production

---

## Input Validation

- All external input validated with Zod at the boundary (API routes, server actions)
- Schemas in `lib/schemas/`
- Never pass unvalidated data into service functions
- Never log sensitive data (entry content, user PII)
