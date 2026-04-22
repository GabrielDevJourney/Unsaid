---
name: supabase-change-review
description: Pre-migration checklist for Unsaid. Run before writing or applying any Supabase migration — covers rollback safety, RLS policies, RPCs, transformers, Zod schemas, domain types, and local testing steps before npx supabase db push.
---

# Supabase Change Review

Run this checklist before applying any migration to production.

---

## Before Writing the Migration

- [ ] Can this migration be rolled back? If not, document the data risk explicitly.
- [ ] Does this add a NOT NULL column to an existing table? If yes, a default value or backfill migration is required first.
- [ ] Does this rename or drop a column? Check all `repo.ts` files for references before proceeding.

## After Writing the Migration File

- [ ] **RLS policies** — does the new table or column need a policy? Every user-scoped table needs one.
- [ ] **RPCs** — does any existing Postgres function reference the changed schema? Check `types/database.ts` Functions section.
- [ ] **Transformers** — does `lib/[domain]/transformers.ts` need updating for new/renamed columns?
- [ ] **Zod schemas** — does `lib/schemas/` need a new or updated schema?
- [ ] **Domain types** — do `types/domain/` interfaces reflect the new shape?

## Before Pushing to Production

- [ ] Run locally: `npx supabase migration up`
- [ ] Regenerate types: `npx supabase gen types typescript --local > types/database.ts`
- [ ] Verify TypeScript compiles: `npx tsc --noEmit`
- [ ] Test the affected flow manually in local dev
- [ ] Code is committed and PR is merged (or ready to merge)

## Push Command

```bash
npx supabase db push
```

Never run `supabase db push` until code is in the repo and ready to merge. See `docs/local-testing.md` for full local setup.
