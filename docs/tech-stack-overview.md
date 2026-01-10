## 1. Stack Overview

### **Core Framework**

- **Next.js 16 (App Router)** - Full-stack React framework, frontend + backend in one codebase
- **TypeScript** - Type safety across entire application
- **Tailwind CSS** - Utility-first CSS for fast styling
- **shadcn/ui** - Copy-paste component library (we own the code)

### **State & Validation**

- **Zustand** - Minimal state management (draft content, UI state, current insight)
- **Zod** - Runtime validation library
    - **Why:** TypeScript only validates at compile time. Zod validates at runtime.
    - **What it prevents:**
        - User submits 50,000 character entry → catches before DB
        - API receives malformed JSON → rejects before processing
        - Invalid webhook payloads → blocks before executing logic
    - **Where we use it:**
        - All API route inputs (entry creation, feedback submission)
        - Form validation (character limits, required fields)
        - Webhook payload verification (Lemon Squeezy events)

### **Database & Auth**

- **Supabase** - Postgres with pgvector extension for semantic search
- **Clerk** - Authentication (email/password, handles sessions and verification)
    - *Note: For mobile later, may switch to Supabase Auth*

### **AI Stack**

- **Vercel AI SDK** - Unified interface for all AI providers
    - **Why single SDK:**
        - Handles both Anthropic Claude & OpenAI through one interface
        - Consistent API across all providers (streaming, structured outputs, embeddings)
        - Switch between providers (Claude ↔ GPT ↔ Gemini) without rewriting code
        - Built-in streaming for real-time UX
        - Edge runtime compatible (faster globally)
- **Usage breakdown:**

| Component | Model | Format | Why This Model | Cost |
| --- | --- | --- | --- | --- |
| Tier 1 insights | Haiku | Streaming text | Fast response, conversational | (fast, $0.25/1M tokens) |
| Next prompt | Haiku | Simple text | Quick generation, contextual | (fast, $0.25/1M tokens) |
| Tier 2 patterns | Sonnet | Structured JSON | Deep analysis, pattern cards | (deep, $3/1M tokens) |
| Tier 3 progress | Sonnet | Structured JSON | Complex reasoning, accountability | (deep, $3/1M tokens) |
| Embeddings | OpenAI | Vector (1536d) | Semantic search via pgvector | ($0.02/1M tokens) |

### **Payments**

- **Lemon Squeezy** - Merchant of record (handles tax/VAT globally), 5% fee

### **Infrastructure**

- **Vercel** - Hosting + cron jobs (for weekly pattern generation)
- **Resend** - Email delivery with React Email templates
- **PostHog** - Product analytics and event tracking
    - **Why:** Need to understand user behavior to improve product
    - **What we track:**
        - Conversion funnel: trial_started → entries_created → trial_converted
        - Feature usage: which tiers users engage with most
        - Retention patterns: when do users drop off
        - A/B test results: if we test different prompts or flows
    - **Why not Google Analytics:** PostHog gives session replay (watch how users actually use the app), feature flags for gradual rollouts, and privacy-friendly (EU compliant)
- **Sentry** - Error tracking and performance monitoring
    - **Why:** We're flying blind without it
    - **What it catches:**
        - AI API failures (timeout, rate limit, invalid response)
        - Payment webhook failures (missed subscription events = lost revenue)
        - Database errors (slow queries, connection issues)
        - Frontend crashes (user sees blank page, we see exact error + what led to it)
    - **Real benefit:** When user reports "app broke," we see:
        - Exact error with stack trace
        - User's actions leading up to error (breadcrumbs)
        - Which deploy introduced the bug
        - How many users affected
    - **Why not just console.log:** Logs disappear, Sentry persists and alerts us immediately

---

## 2. What We're NOT Using

**❌ Redux** - Too much boilerplate, Zustand is simpler

**❌ lodash** - Modern JS has built-in equivalents

**❌ Separate Backend** - Next.js API routes sufficient

**❌ Redis/Upstash** - Postgres rate limiting fine for MVP

**❌ Pinecone/Weaviate** - Supabase pgvector handles semantic search

**❌ GraphQL** - REST simpler for our use case

**❌ Docker/Kubernetes** - Vercel handles deployment

---

## 4. Why This Stack Works

**Speed:** No separate backend, everything in Next.js = faster iteration

**Cost:** 93% gross margin, profitable from Day 1

**Mobile-Ready:** When we build React Native, reuse all API routes

**Proven:** Every tool battle-tested by thousands of apps

**Observability:** Sentry + PostHog = we know what's working and what's broken

**Future-Proof:** Vercel AI SDK = easy to switch providers if needed

---

## 5. Monthly Costs (100 Active Users)

| Service | Cost | Note |
| --- | --- | --- |
| Vercel | $0 | Hobby tier sufficient |
| Supabase | $0 | Free tier: 500MB + 2GB bandwidth |
| Clerk | $0 | Free up to 10k users |
| AI (Claude + OpenAI) | ~$26 | Per 100 users writing 4x/week |
| Resend | $0 | Free tier: 3k emails/month |
| PostHog | $0 | Free tier: 1M events/month |
| Sentry | $0 | Free tier: 5k errors/month |
| Lemon Squeezy | 5% | Of revenue only |

**Total: ~$26/month + 5% payment fees**

At 100 paid users × $12.99/month:

- Revenue: $1,299
- Costs: $26 (AI) + $65 (Lemon Squeezy)
- **Profit: $1,208 (89% margin)**