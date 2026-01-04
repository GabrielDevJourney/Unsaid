# Unsaid

An AI journaling coach that doesn't let you bullshit yourself. Write about anything—the AI spots patterns you can't see, tracks your progress, and asks the questions you're avoiding.

## How It Works

```
Write → Immediate insight → Weekly patterns → Progress checks
```

1. **Write** - Clean entry page with AI-generated prompts
2. **Tier 1** - Immediate streaming insight after each entry
3. **Tier 2** - Weekly pattern cards (auto-generated Sunday)
4. **Tier 3** - Progress checks every 15 entries with semantic search

## Status

Backend complete. Waiting for UI design.

### Complete

- Database schema with RLS policies
- Clerk authentication + Supabase integration
- Entry creation with embeddings + rate limiting
- Tier 1: Streaming entry insights (Claude Haiku)
- Tier 2: Weekly pattern generation (Claude Sonnet)
- Tier 3: Progress insights with semantic search (Claude Sonnet)
- Entry theme prompts (contextual AI-generated)
- Semantic search API (pgvector)
- Email infrastructure (Resend + React Email)
- Trial/subscription logic (7-day trial, soft-block)
- Payment integration (Lemon Squeezy webhooks)
- Feedback forum (CRUD + voting)
- Cron jobs (weekly insights, trial reminders)

### In Progress

- Payment flow end-to-end testing
- Core UI (waiting for design)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres + pgvector) |
| Auth | Clerk |
| AI | Vercel AI SDK + Anthropic + OpenAI |
| Email | Resend + React Email |
| Payments | Lemon Squeezy |
| Hosting | Vercel |

## Project Structure

```
app/
├── api/              # API routes
│   ├── cron/         # Scheduled jobs
│   └── webhooks/     # Clerk, Lemon Squeezy
├── actions/          # Server actions
lib/
├── {domain}/
│   ├── repo.ts       # Database access
│   └── service.ts    # Business logic
├── ai/               # AI generation functions
├── email/            # Email service
├── schemas/          # Zod validation
├── constants.ts      # Shared constants
prompts/              # AI prompt templates
emails/               # React Email templates
docs/                 # Project documentation
```

## Running Locally

```bash
# Install dependencies
npm install

# Start local Supabase
npx supabase start

# Copy environment variables
cp .env.example .env.local
# Fill in values (see below)

# Run database migrations
npx supabase db push

# Run dev server
npm run dev
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Email
RESEND_API_KEY=

# Payments
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=

# Cron
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run Biome linter
npm run format       # Format code
npm test             # Run tests
```

## Documentation

- `docs/mvp-scope.md` - Full MVP reference
- `docs/planning.md` - Development phases
- `docs/pre-design-tasks.md` - Current task list
- `CLAUDE.md` - AI coding conventions

## License

MIT
