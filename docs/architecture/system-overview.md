# System Architecture Overview

## Layer Responsibilities

```
Browser / Client Component
        ↓
app/(dashboard)/*/page.tsx         ← Server Component, data fetching only
        ↓
app/actions/ or app/api/           ← Thin controller: parse, validate, delegate
        ↓
lib/[domain]/service.ts            ← Business logic, orchestration
        ↓
lib/[domain]/repo.ts               ← Raw Supabase queries
        ↓
Supabase (Postgres + RLS)          ← Data enforcement layer
```

**Import rule:** `app/` → `lib/` OK. `lib/` → `app/` never. Repos never call services.

---

## Route Groups

| Group | Path | Purpose |
|-------|------|---------|
| Auth | `app/(auth)/` | sign-in, sign-up, privacy, terms |
| Dashboard | `app/(dashboard)/` | all user-facing routes |
| API | `app/api/` | JSON API routes |
| Cron | `app/api/cron/` | scheduled jobs (protected by CRON_SECRET) |
| Webhooks | `app/api/webhooks/` | Lemon Squeezy + Clerk webhooks |
| Admin | `app/(dashboard)/backstage/` | internal admin views |

## Dashboard Routes

| Route | Page Component | Client View |
|-------|---------------|-------------|
| `/home` | `home/page.tsx` | `components/home/home-view.tsx` |
| `/entries/new` | `entries/new/page.tsx` | `components/entries/entry-editor-page.tsx` |
| `/entries/[id]` | `entries/[id]/page.tsx` | `components/entries/entry-editor-page.tsx` |
| `/patterns` | `patterns/page.tsx` | `components/patterns/patterns-view.tsx` |
| `/patterns/[id]` | `patterns/[id]/page.tsx` | — |
| `/progress` | `progress/page.tsx` | — |
| `/progress/[id]` | `progress/[id]/page.tsx` | — |
| `/settings` | `settings/page.tsx` | — |
| `/upgrade` | `upgrade/page.tsx` | — |
| `/feedback` | `feedback/page.tsx` | — |

---

## lib/ Domain Map

| Domain | Owns |
|--------|------|
| `lib/entries/` | Entry CRUD, embedding generation, rate limiting |
| `lib/entry-insights/` | Tier 1 insight storage and retrieval |
| `lib/weekly-insights/` | Tier 2 pattern generation and storage |
| `lib/progress-insights/` | Tier 3 progress report generation and storage |
| `lib/triggers/` | `check-progress-trigger.ts` — fires Tier 3 after every 15 entries |
| `lib/semantic-search/` | pgvector similarity search across entries and patterns |
| `lib/subscriptions/` | Lemon Squeezy subscription state, entitlement checks |
| `lib/trial/` | Trial period logic (`TRIAL_DAYS = 7`) |
| `lib/users/` | User profile, notification preferences, deletion |
| `lib/email/` | Resend integration, email templates |
| `lib/ai/` | Model calls for all 3 tiers, embedding generation |
| `lib/crypto.ts` | AES-256-GCM encrypt/decrypt (entry content + insights) |
| `lib/auth/` | Clerk admin client |
| `lib/supabase/` | Supabase client factories (anon, admin, middleware) |
| `lib/schemas/` | Zod schemas for all external input and AI output |
| `lib/stores/` | Zustand stores (2 only — see frontend rules) |
| `lib/constants/` | App-wide constants and enums |
| `lib/context/` | React context providers (entitlement context) |
| `lib/hooks/` | Shared React hooks |

---

## Client / Server Component Split

**Pattern:** Server page fetches all data → passes props to a single client view component.

**Entry editor example:**
```
app/(dashboard)/entries/new/page.tsx      ← Server: checks entitlements, fetches context
        ↓ props
components/entries/entry-editor-page.tsx  ← Client: mounts store, handles save, streaming
        ↓
components/entries/entry-editor.tsx       ← Client: textarea, insight display, autosave
```

**Home example:**
```
app/(dashboard)/home/page.tsx             ← Server: fetches entries, totals, dates
        ↓ props
components/home/home-view.tsx             ← Client: filters, search, infinite scroll
  ├─ components/home/home-toolbar.tsx     ← Client: filter/search UI
  ├─ components/home/entry-card-grid.tsx  ← Client: cards, deletion callbacks
  └─ components/home/home-aside.tsx       ← Client: stats, calendar
```

---

## Key External Services

| Service | Purpose | Integration point |
|---------|---------|-------------------|
| Clerk | Auth (JWT, user management) | `@clerk/nextjs/server` in every route |
| Supabase | Postgres + pgvector + RLS | `lib/supabase/` client factories |
| Anthropic | Claude Haiku/Sonnet for insights | `lib/ai/` via Vercel AI SDK |
| OpenAI | text-embedding-3-small | `lib/ai/embeddings.ts` |
| Lemon Squeezy | Payments, subscriptions | `app/api/webhooks/lemon-squeezy/` |
| Resend | Transactional email | `lib/email/service.ts` |
| PostHog | Analytics | client-side via provider |
| Sentry | Error tracking | auto-instrumented + manual captures |
| Vercel | Hosting, cron scheduling | `vercel.json` for cron config |
