# Unsaid - MVP Scope

Complete reference for the MVP. What we're building, why, and how.

**Last updated:** January 2025

---

## 1. What Is Unsaid?

> An AI coach that doesn't let you bullshit yourself. Write about anything—the AI spots patterns you can't see, tracks your progress, and asks the questions you're avoiding.

### What Makes It Different

| Other Apps | Unsaid |
|------------|--------|
| Just insights | Tracks if you're actually changing |
| Just prompts | Follows your story with semantic memory |
| Just supportive | Direct accountability with receipts |

### Who Is It For

- People who journal but feel stuck in loops
- People who want therapy-level insight without the cost
- People tired of apps that just say "great job!"
- People ready for honest reflection, not validation

### The Bet

People will pay $12.99/month for an AI that tells them the truth about themselves—especially when it has receipts from their own writing.

---

## 2. Core Loop (30 Seconds)

```
Write → Immediate insight → Weekly patterns → Progress checks
```

1. **Write** - Clean entry page, AI-generated prompt based on last entry
2. **Immediate insight** - AI responds (streaming), ends with reflective question
3. **Weekly patterns** - Every Sunday, AI surfaces 1-3 pattern cards
4. **Progress checks** - Every 15 entries, AI shows what's changed vs stuck

**The magic:** Semantic search finds when you wrote about the same thing months ago.

---

## 3. AI Pipeline (3 Tiers)

### Tier 1: Immediate Insight

| Aspect | Detail |
|--------|--------|
| **When** | After every entry |
| **Model** | Claude Haiku (streaming) |
| **Output** | 2-4 sentences + reflective question |
| **Purpose** | Show user AI understands them |

**Example:**
> "You said 'I need to set boundaries' again. That's the third time this week. When you avoid saying no—what's the fear underneath?"

### Tier 2: Weekly Patterns

| Aspect | Detail |
|--------|--------|
| **When** | Sunday (cron job), if 2+ entries that week |
| **Model** | Claude Sonnet |
| **Output** | 1-3 pattern cards (JSON) |
| **Purpose** | Surface recurring themes user can't see |

**Pattern Types:**
- Recurring themes
- Emotional triggers
- Cognitive distortions
- Behavioral loops
- Avoidance patterns

**Example Card:**
> **Sunday Anticipation Spiral** (Emotional Trigger)
> You write about work stress on Mondays, but your Sunday entries show the most anxiety—before anything happens.

### Tier 3: Progress Check

| Aspect | Detail |
|--------|--------|
| **When** | After 15th, 30th, 45th entry |
| **Model** | Claude Sonnet + semantic search |
| **Output** | "THE HEADLINE" format (150-200 words) |
| **Purpose** | Accountability—what changed vs what's stuck |

**Format:**
```
THE HEADLINE: You're aware of the problem but not changing the behavior.

WHAT'S ON REPEAT: "I need boundaries" (6 entries). "I said yes again" (4 entries).

WHAT CHANGED: You stopped self-criticism around entry 8.

THE REALITY CHECK: Awareness without action is sophisticated avoidance.

EXPERIMENT: Say "Let me check my calendar" to ONE request this week.

THE QUESTION: What's scarier—having limits or resenting yourself for not having them?
```

---

## 4. MVP Features

### In Scope (Must Ship)

#### Core Journaling
- Entry page with auto-save
- AI-generated contextual prompts (based on last entry)
- Processing screen after submission
- Word-by-word streaming insights (Tier 1)
- Max 16,000 characters per entry

#### AI Pipeline
- Tier 1: Immediate insight (every entry)
- Tier 2: Weekly patterns (Sunday, auto)
- Tier 3: Progress checks (every 15 entries)
- Semantic search (OpenAI embeddings + pgvector)

#### UI (4 Tabs)
| Tab | Purpose |
|-----|---------|
| **Home** | Entry list, tap to expand Tier 1 insight |
| **Patterns** | Weekly pattern cards (Tier 2) |
| **Progress** | Milestone cards (Tier 3) - visually distinct |
| **Profile** | Settings, subscription, feedback |

#### Subscription
- 7-day free trial (no credit card)
- $12.99/month or $99/year
- Lemon Squeezy integration
- Soft-block on expiry (can view, can't create)

#### Notifications (Email)
- Weekly patterns ready (Sunday)
- Progress check ready (after 15 entries)
- Trial ending (Day 6 banner)

#### Feedback Forum
- Upvoting system
- Categories: bug, feature, improvement, other
- Status tracking (new, planned, in_progress, completed, wont_do)
- Comments on feedback items

---

### Out of Scope (Phase 2+)

| Feature | Why Wait |
|---------|----------|
| On-demand "Dive deeper" | Unpredictable costs |
| Voice journaling | Test text-only first |
| Photo/scan upload | Adds complexity |
| Mood tracking graphs | Risks becoming shallow |
| Streak counters | Only if data shows it helps |
| Export/share | Reduces retention |
| Social/community | Journaling is private |
| Dark mode | Pick one theme, ship faster |
| Multiple AI tones | One voice, done well |
| Push notifications | Email only for web MVP |

---

### Never Building

- Headspace-style courses (we're a coach, not a teacher)
- Social features (privacy is core)
- Gamification for its own sake

---

## 5. User Flows

### Flow A: New User Onboarding

```
Landing → Value Prop → How It Works → Create Account → First Entry
```

**Screen 1: Value Prop**
- "Understand yourself through journaling"
- Button: "Start 7-day free trial"

**Screen 2: How It Works**
- 3 cards showing Tier 1, 2, 3
- "AI spots patterns you can't see"

**Screen 3: Create Account**
- Email + password
- No credit card required (prominent)

**Screen 4: First Entry**
- "What's been on your mind lately?"
- Clean textarea, auto-focus

---

### Flow B: Daily Entry

```
Home → Tap "+" → Entry Page → Done → Processing → Streaming Insight → Close
```

**Entry Page:**
- AI prompt at top (contextual)
- Auto-save every 2 seconds
- Character count (subtle)
- "Done" button (after 10+ chars)

**Processing Screen:**
- 3-5 seconds, cannot skip
- "Reflecting on what you wrote..."

**Insight Display:**
- Streams word-by-word
- Ends with reflective question
- Close returns to Home

---

### Flow C: Weekly Patterns

```
Sunday 9pm → Cron generates patterns → Email sent → User opens app → Views cards
```

**Email:**
- Subject: "Your weekly patterns are ready"
- Shows pattern count, previews
- CTA: "View patterns"

**Patterns Tab:**
- "New" badge on unread
- Tap card to expand
- Evidence shows related entries

---

### Flow D: Progress Check

```
15th entry saved → Semantic search runs → Tier 3 generated → Email sent → User views
```

**Email:**
- Subject: "Your progress check is ready"
- Shows THE HEADLINE preview
- CTA: "View your progress"

**Progress Tab:**
- Milestone cards (visually distinct from patterns)
- Different color/style
- Shows milestone number (15, 30, 45)

---

### Flow E: Trial → Paid

```
Day 6 → Banner appears → Day 7 → Conversion screen → Lemon Squeezy checkout → Active
```

**Day 6 Banner:**
- "Your trial ends tomorrow"
- Not dismissible

**Day 7 Conversion Screen:**
- Fullscreen modal
- Shows: entries written, insights received, patterns identified
- Quote their most powerful insight
- $12.99/month or $99/year
- "I need more time" → 3-day extension (one-time)

---

## 6. Database Schema

### Current Tables

| Table | Purpose |
|-------|---------|
| `users` | Clerk sync, profile |
| `entries` | Journal entries + embeddings |
| `entry_insights` | Tier 1 insights (1:1 with entries) |
| `weekly_insights` | Tier 2 weekly records |
| `weekly_insight_patterns` | Pattern cards (1:many with weekly_insights) |
| `progress_insights` | Tier 3 milestone reports |
| `prompts` | AI-generated entry prompts |
| `user_progress` | Entry counts, trigger tracking |
| `subscriptions` | Trial/payment status |
| `payment_events` | Webhook idempotency |
| `feedback` | User feedback + comments |
| `feedback_votes` | Upvotes (1 per user per feedback) |

### Key Relationships

```
users (1) ──── (many) entries
entries (1) ──── (1) entry_insights
users (1) ──── (many) weekly_insights
weekly_insights (1) ──── (many) weekly_insight_patterns
users (1) ──── (many) progress_insights
users (1) ──── (1) subscriptions
users (1) ──── (1) user_progress
```

---

## 7. API Routes

### Entries

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/entries` | Create entry + trigger Tier 1 |
| GET | `/api/entries` | List entries (paginated) |
| GET | `/api/entries/[id]` | Get single entry |
| GET | `/api/entries/search` | Semantic search |
| GET | `/api/entries/[id]/related` | Find related entries |

### Insights

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/entry-insights` | Generate Tier 1 (streaming) |
| GET | `/api/insights/weekly` | List weekly insights |
| GET | `/api/insights/weekly/[weekStart]` | Specific week + patterns |
| GET | `/api/insights/progress` | List progress insights |
| POST | `/api/insights/progress/generate` | Manual Tier 3 trigger |

### Prompts

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/prompts/entry-theme` | Get contextual prompt |
| POST | `/api/prompts/entry-theme/refresh` | Force new prompt |

### Subscription

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/subscription` | Get user subscription |
| POST | `/api/payments/checkout` | Create Lemon Squeezy checkout |

### Feedback

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback` | List feedback |
| POST | `/api/feedback/[id]/vote` | Upvote |
| POST | `/api/feedback/[id]/comment` | Add comment |
| PATCH | `/api/feedback/[id]/status` | Update status (admin) |

### Webhooks

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/webhooks` | Clerk user sync |
| POST | `/api/webhooks/lemonsqueezy` | Payment events |

### Cron Jobs

| Method | Route | Schedule |
|--------|-------|----------|
| GET | `/api/cron/weekly-insights` | Monday 10am UTC |
| GET | `/api/cron/trial-reminder` | Daily 9am UTC |

---

## 8. Email Templates

### Trial Ending

**Subject:** Your trial ends in {X} days

**Content:**
- Entries written, insights received
- CTA: "Continue your journey - $12.99/month"

### Weekly Patterns

**Subject:** Your weekly patterns are ready

**Content:**
- Pattern count, previews (up to 3)
- CTA: "View all patterns"

### Progress Check

**Subject:** Your progress check is ready

**Content:**
- THE HEADLINE preview
- CTA: "View your progress"

---

## 9. Subscription States

| Status | Can View | Can Create | Can Export |
|--------|----------|------------|------------|
| trial (active) | Yes | Yes | Yes |
| active | Yes | Yes | Yes |
| canceled (in period) | Yes | Yes | Yes |
| canceled (past period) | Yes | No | Yes |
| expired | Yes | No | Yes |

**Visual Indicators:**
- Green: Active subscription
- Yellow: Subscription ending
- Red: Expired

---

## 10. Success Metrics

### Week 1 (Activation)

| Metric | Target |
|--------|--------|
| Day 1 retention | >50% |
| Day 7 retention | >30% |
| Entries per user | >3 |

### Week 2 (Monetization)

| Metric | Target |
|--------|--------|
| Trial → paid | >20% |
| Feedback submissions | >10 |
| Qualitative | "This app sees me" |

### Month 1 (Product-Market Fit)

| Metric | Target |
|--------|--------|
| Monthly churn | <5% |
| NPS | >50 |

### Cost Targets

| Metric | Target |
|--------|--------|
| AI cost per user | <$0.75/month |
| Total cost per user | <$1.40/month |
| Gross margin | >89% |

### The One Question

> "After 7 days, do users feel Unsaid knows them better than their friends do?"

If yes → they pay. If no → iterate prompts.

---

## 11. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | Supabase (Postgres + pgvector) |
| Auth | Clerk |
| AI | Vercel AI SDK + Anthropic + OpenAI |
| Email | Resend + React Email |
| Payments | Lemon Squeezy |
| Hosting | Vercel |
| Testing | Vitest |

---

## 12. Design System

### Colors

```css
/* Brand */
--color-primary: #2563eb;    /* Blue */
--color-secondary: #f59e0b;  /* Orange (Progress tab) */

/* Status */
--color-success: #10b981;    /* Green - active */
--color-warning: #f59e0b;    /* Yellow - ending */
--color-error: #ef4444;      /* Red - expired */
```

### Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px - entry text */
--leading-relaxed: 1.6; /* line height */
```

### Spacing

```css
--space-4: 1rem;   /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem;   /* 32px */
```

---

## 13. Component Library (shadcn/ui)

**Installed:**
- button, input, textarea, card
- dropdown-menu, dialog, badge
- separator, toast, avatar, switch
- tabs, form, label

**Custom Components:**
- EntryCard - Entry preview with expandable insight
- PatternCard - Weekly pattern display
- ProgressCard - Milestone display (distinct style)
- StreamingText - Word-by-word streaming
- SubscriptionStatus - Colored indicator

---

## 14. Validation Rules

```typescript
// Entry: 10-16,000 characters
EntryCreateSchema = z.object({
  content: z.string().min(10).max(16000)
});

// Feedback
FeedbackCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.enum(['bug', 'feature', 'improvement', 'other'])
});
```

---

## 15. Error Handling

### Entry Page

| Error | Response |
|-------|----------|
| API timeout | "Taking longer than usual... [Retry]" |
| Character limit | Prevent typing, show toast |
| Network offline | Allow typing, warn "offline" |

### Weekly Patterns

| Edge Case | Response |
|-----------|----------|
| 1 entry this week | Don't generate, show empty state |
| 10+ entries | Still generate 1-3 patterns |

### Progress Checks

| Edge Case | Response |
|-----------|----------|
| Deleted entries | Show "[Entry no longer available]" |
| Trial expires mid-entry | Allow finish, then lock |

---

## 16. Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Entry page load | <500ms | <1s |
| Auto-save | <200ms | <500ms |
| Tier 1 first word | <2s | <5s |
| Tier 1 complete | <8s | <15s |
| Home tab (20 entries) | <400ms | <1s |

---

## 17. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI feels generic | Test prompts with real entries, iterate until "holy shit" moment |
| Users don't write enough | Tier 1 + 2 still valuable; track: do 15-entry users convert higher? |
| "Too harsh" feedback | Tier 3 is 70% direct, 30% encouraging; A/B test if needed |
| Competitors copy | Semantic search + longitudinal tracking is complex |

---

## 18. What's Built vs Missing

### Built (Backend Complete)

- Entry creation with embeddings
- Tier 1, 2, 3 insights working
- Semantic search API
- User sync via Clerk
- Rate limiting
- Full RLS security
- Entry theme prompts
- Feedback forum (CRUD + voting)
- Payment integration (Lemon Squeezy)
- Trial logic (7-day, soft-block)
- All 3 email templates
- Cron jobs configured
- Centralized constants

### In Progress

- Payment flow end-to-end testing

### Missing (MVP Critical)

- Core UI (4 tabs + pages)
- Waiting for design

### Post-MVP

- PostHog analytics
- Sentry error tracking
- Voice journaling
- Monthly evolution reports

---

## 19. Timeline

| Phase | Status | Effort |
|-------|--------|--------|
| Phase 0-10: Backend core | Complete | - |
| Phase 11: Feedback forum | Complete | - |
| Phase 12: Payments | 90% (testing) | 2-3h |
| Phase 13: Emails | Complete | - |
| Phase 14: Core UI | Waiting for design | 40-60h |
| Phase 15: Polish & Launch | Pending | 16-24h |

**Current blocker:** Design screens from Cathy

---

## 20. Quick Reference

### Constants

```typescript
TRIAL_DAYS = 7
PROGRESS_TRIGGER_INTERVAL = 15
MAX_ENTRY_LENGTH = 16000
MIN_ENTRY_LENGTH = 10
MIN_ENTRIES_FOR_WEEKLY_INSIGHT = 2
```

### Models Used

| Tier | Model | Cost |
|------|-------|------|
| Tier 1 | claude-haiku-4-5 | ~$0.001/entry |
| Tier 2 | claude-sonnet-4-5 | ~$0.08/week |
| Tier 3 | claude-sonnet-4-5 | ~$0.20/15 entries |
| Embeddings | text-embedding-3-small | ~$0.00005/entry |

### Key Files

```
lib/constants.ts         - All magic numbers
lib/entries/service.ts   - Entry creation logic
lib/ai/                  - AI generation functions
lib/email/service.ts     - Email sending
prompts/                 - AI prompt templates
emails/                  - React Email templates
```

---

## Appendix: The Vision

**Speed:** No separate backend (Next.js handles everything)

**Cost:** 89% margin, profitable from user #1

**Differentiation:** Only app that tracks change over time with semantic memory

**Moat:** The longer users write, the better insights get (historical context compounds)

**Mobile-Ready:** When we build React Native, reuse all API routes
