# Unsaid - Development Plan

## Overview

Build the AI journaling backend first, test with simple UI, add design later.

**Core loop:** Write entry → Get insight → See patterns → Track progress

**MVP Goal:** Validate that people will pay $12.99/month for an AI that tells them the truth about themselves.

---

## Current Status

### Backend: Complete ✅

| Component | Status |
|-----------|--------|
| Auth (Clerk) | ✅ Done |
| Database + RLS | ✅ Done |
| Entry creation + embeddings | ✅ Done |
| Tier 1, 2, 3 insights | ✅ Done |
| Semantic search | ✅ Done |
| Email infrastructure | ✅ Done |
| Cron jobs | ✅ Done |
| Feedback forum API | ✅ Done |
| Payment integration | ✅ Done (testing pending) |

### Infrastructure: Complete ✅

| Component | Status |
|-----------|--------|
| Vercel deployment | ✅ Done |
| Supabase (production) | ✅ Done |
| Clerk (production + Google OAuth) | ✅ Done |
| Resend DNS | ✅ Done |
| Sentry error tracking | ✅ Done |
| Domain (byunsaid.com) | ⏸️ Ticket created |

### Blocking

- **Lemon Squeezy:** Account in review - can't test payments yet
- **Design screens:** Needed for Phase 14 (Core UI)

---

## Current Focus

### Immediate (Before Users)

| Task | Status | Notes |
|------|--------|-------|
| Lemon Squeezy test flow | ⏸️ Blocked | Account in review |
| Connect domain | ⬜ Ready | Vercel + Hostinger DNS |
| Delete Sentry example page | ⬜ Quick | Cleanup |
| Add Sentry.setUser() with Clerk | ⬜ P1 | Link errors to users |

### Before Design Arrives

| Task | Priority | Notes |
|------|----------|-------|
| Write 3 critical tests | P1 | AI parsing, Zod schemas, trigger logic |
| Build minimal functional UI | P1 | Dogfood the product |
| Error handling polish | P2 | lib/errors.ts, consistent format |
| Prompt documentation | P2 | What each tier does |

### What NOT To Do Now

| Skip | Why |
|------|-----|
| Comprehensive tests | Product will change |
| Performance optimization | No users = no data |
| PostHog | No users to track |
| Monorepo | No mobile app yet |
| Redis caching | In-memory is fine |

---

## Completed Phases

<details>
<summary>Phase 0-10: Foundation + AI Pipeline ✅</summary>

### Phase 0: Project Setup ✅
- Next.js 16 + TypeScript + Tailwind + App Router
- Supabase project + pgvector extension
- Clerk authentication
- Environment variables + Git repository

### Phase 1: Database Schema ✅
- All tables with RLS policies
- Supabase clients (server + admin)

### Phase 2: AI Prompts ✅
- System prompt + all tier prompts
- Tested with real entries

### Phase 3: User Sync ✅
- Clerk webhook integration

### Phase 4: Entry Creation ✅
- CRUD + embeddings + rate limiting

### Phase 5: Entry Insights (Tier 1) ✅
- Streaming insight generation

### Phase 6: Weekly Insights (Tier 2) ✅
- Pattern cards + cron job

### Phase 7: Semantic Search ✅
- pgvector cosine similarity

### Phase 8: Progress Insights (Tier 3) ✅
- Auto-trigger every 15 entries

### Phase 9: Complete API Gaps ✅
- All insight retrieval endpoints

### Phase 10: Entry Theme Prompts ✅
- Contextual AI-generated prompts

</details>

<details>
<summary>Phase 11: Feedback Forum ✅</summary>

- Full CRUD + voting system
- Categories: bug, feature, improvement, other
- Admin status updates via API

</details>

<details>
<summary>Phase 12: Payment Integration ✅</summary>

- Lemon Squeezy webhooks
- Trial logic (7 days)
- Soft-block on expiry
- Checkout flow

**Testing pending** - account in review

</details>

<details>
<summary>Phase 13: Email Infrastructure ✅</summary>

- 3 templates: trial-ending, weekly-patterns, progress-check
- Cron jobs configured
- Resend integration

</details>

---

## Remaining MVP Phases

### Phase 14: Core UI (Waiting for Design)

5 pages + feedback:

```
app/(app)/
├─ page.tsx              # Home - Entry list
├─ write/page.tsx        # Write - Entry creation + insight
├─ patterns/page.tsx     # Patterns - Weekly cards
├─ progress/page.tsx     # Progress - Milestone cards
├─ feedback/page.tsx     # Feedback - Forum
├─ settings/page.tsx     # Settings - Subscription + logout
└─ layout.tsx            # Navigation
```

### Phase 15: Polish & Launch

- Error boundaries
- Loading/empty states
- Trial banner + upgrade modal
- Mobile testing
- Production deployment

---

## Post-MVP Roadmap

Things to implement after MVP launch, based on user feedback and scale needs.

### High Priority (Week 2-4 after launch)

| Feature | Why | Effort |
|---------|-----|--------|
| PostHog analytics | Understand user behavior | 2h |
| Sentry.setUser() | Link errors to Clerk users | 30min |
| Entry prompt caching | Reduce AI costs | 2h |

### Medium Priority (Month 1-2)

| Feature | Why | Effort |
|---------|-----|--------|
| Error handling polish | Consistent error responses, lib/errors.ts | 4h |
| Retry logic for AI calls | Handle transient failures | 2h |
| Prompt quality tracking | Which prompts → entries | 4h |
| Structured logging (pino) | Better debugging | 2h |

### Lower Priority (Month 2+)

| Feature | Why | Effort |
|---------|-----|--------|
| Performance optimization | Based on real usage data | 1-2d |
| Redis caching | If in-memory becomes bottleneck | 4h |
| Monthly evolution reports | 3/6 month milestones | 1d |
| Voice journaling | Speech-to-text entries | 2d |

### When Mobile is Needed

| Feature | Why | Effort |
|---------|-----|--------|
| Monorepo migration | Share code web/mobile | 1d |
| React Native app | Mobile-first users | 2-4w |
| Push notifications | Replace email for mobile | 4h |

**Monorepo structure (when needed):**
```
apps/
├── web/           # Next.js app
├── mobile/        # React Native app
packages/
├── backend/       # lib/* extracted
├── types/         # Shared TypeScript types
└── config/        # Shared configs
```

---

## Success Metrics

### Week 1 (Activation)
- Day 1 retention: >50%
- Day 7 retention: >30%
- Entries per user: >3

### Week 2 (Monetization)
- Trial → paid: >20%
- Feedback submissions: >10

### Month 1 (Product-Market Fit)
- Monthly churn: <5%
- NPS: >50

---

## Quick Reference

### Built ✅
- Entry creation + embeddings
- All 3 insight tiers
- Semantic search
- Feedback forum
- Payment integration
- Email infrastructure
- Cron jobs
- Sentry error tracking
- Domain connection

### In Progress ⏳
- Payment flow testing (blocked on Lemon Squeezy)

### Missing (MVP Critical) ❌
- Core UI (waiting for design)

### Post-MVP 🚫
- PostHog analytics
- Performance optimization
- Monorepo (mobile)
- Voice journaling
- User subscription managing dashboard
