# Unsaid

An AI journaling app that helps people understand themselves through pattern recognition and reflection.

## The idea

Journaling is powerful, but most people stop because they don't see the value. Unsaid reads your entries, finds patterns you might miss, and reflects them back to you — not as advice, but as observations that help you connect the dots.

**Core loop:** Write → Get insight → See patterns over time → Track progress

## Status

Work in progress. Backend-first approach — building the AI pipeline before the UI.

### Completed
- Database schema with RLS policies
- Clerk authentication + Supabase integration
- User sync via webhooks
- Entry creation API with rate limiting
- Embedding generation for semantic search

### In progress
- Entry insights (streaming AI responses)
- Weekly pattern recognition
- Progress tracking

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (Postgres + pgvector) |
| Auth | Clerk |
| AI | Vercel AI SDK, Claude, OpenAI embeddings |
| Email | Resend + React Email |

## Architecture

```
app/
├── api/           → API routes (controllers)
├── actions/       → Server actions
lib/
├── {domain}/
│   ├── repo.ts    → Database access
│   └── service.ts → Business logic
├── ai/            → AI utilities
├── schemas/       → Zod validation
```

The backend is structured to be portable — services and repos can move to a shared package when adding React Native later.

## Running locally

```bash
# Install dependencies
npm install

# Start local Supabase
npx supabase start

# Copy environment variables
cp .env.example .env.local
# Fill in values from `npx supabase status` and Clerk dashboard

# Run dev server
npm run dev
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

## License

MIT
