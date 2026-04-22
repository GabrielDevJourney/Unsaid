# Backend Rules

## Service / Repo / Transformer Pattern

Every domain in `lib/` follows this three-layer structure. Never skip layers.

### Repo (`lib/[domain]/repo.ts`)
- Raw Supabase queries only
- Returns `{ data: T | null, error }` or `{ data: T[], error }`
- No business logic, no rate limiting, no entitlement checks
- Takes `supabase` client as first argument (always passed in, never created here)
- Example: `lib/entries/repo.ts` — 19 functions covering CRUD, pagination, RPC calls

### Service (`lib/[domain]/service.ts`)
- Business logic and orchestration
- Returns `ServiceResult<T>` = `{ data?: T, error?: string }`
- Calls repos, never raw Supabase
- Owns: rate limiting, entitlement checks, encryption, embedding generation, progress tracking
- Example: `lib/entries/service.ts` — `createEntry()` checks rate limit + entitlements + encrypts + embeds + triggers progress

### Transformer (`lib/[domain]/transformers.ts`)
- Maps encrypted DB rows → domain types
- **Decryption happens here only** — never decrypt in repos or services
- Handles join normalization (e.g., `normalizeInsights()` for Supabase's 1:1 vs 1:many join shape)
- Example: `lib/entries/transformers.ts` — `toEntry()`, `toEntryWithInsight()`, `toEntryWithAllInsights()`

---

## Calling Convention

- `app/` (pages, actions, API routes) calls services — never repos directly
- Services call repos — never raw Supabase queries
- `lib/` never imports from `app/`

---

## Zod Validation

- Validate all external input at the boundary: server actions and API routes
- Schemas live in `lib/schemas/`
- Validated before calling any service function
- Never pass unvalidated data into services

---

## Error Handling

- API routes and server actions return `{ data }` on success, `{ error: string }` on failure
- Never expose stack traces, internal IDs, or Supabase error details to clients
- Log errors server-side (Sentry) — return generic message to client
- Service functions return `ServiceResult<T>` — always check `error` before using `data`

---

## types/database.ts

- **Never edit manually** — this file is generated
- Regenerate after every migration: `npx supabase gen types typescript --local > types/database.ts`
- DB columns are snake_case; domain types are camelCase — transformer handles the mapping

---

## Docs Maintenance

When you modify a service or repo in a way that changes observable behaviour (new function, changed return shape, new side effect), update the relevant section in `docs/architecture/system-overview.md` or `docs/data/data-model.md`.
