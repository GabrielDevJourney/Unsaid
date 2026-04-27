# Data Model

Source of truth: `supabase/migrations/` (34 migrations, Dec 2024 → Apr 2026).  
Generated types: `types/database.ts` — never edit manually.

RLS pattern: every user-scoped table has a policy filtering by `auth.jwt()->>'sub'` (= Clerk `userId`). Queries do not need `.eq('user_id', userId)` — RLS handles it.

---

## Domain: User & Auth

### `users`
Primary user record created by Clerk webhook on `user.created`.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | text PK | Clerk user ID (e.g. `user_abc123`) |
| `id` | uuid | Internal UUID (use `user_id` for auth checks) |
| `email` | text | |
| `username` | text | Display name |
| `role` | text | `user` or `admin` |
| `subscription_status` | text | Denormalized from `subscriptions` for fast reads |
| `trial_started_at` | timestamptz | |
| `trial_ends_at` | timestamptz | |
| `deleted_at` | timestamptz | Set when user initiates deletion — 30-day grace period |
| `notify_weekly_patterns` | bool | Email notification preference |
| `notify_progress_checks` | bool | Email notification preference |
| `notify_writing_reminders` | bool | Email notification preference |
| `last_writing_reminder_sent_at` | timestamptz | Cooldown tracking |

### `subscriptions`
1:1 with `users`. Manages Lemon Squeezy subscription state.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | text FK | References `users.user_id` (1:1) |
| `status` | text | `trial`, `active`, `canceled`, `expired`, `past_due` |
| `trial_ends_at` | timestamptz | |
| `current_period_end` | timestamptz | |
| `lemon_subscription_id` | text | Lemon Squeezy subscription ID |
| `lemon_customer_id` | text | Lemon Squeezy customer ID |
| `plan_id` / `plan_name` | text | |
| `price_in_cents` | int | |
| `customer_portal_url` | text | Direct link to Lemon Squeezy portal |
| `canceled_at` | timestamptz | |

**Entitlement check:** `canUserWriteEntry()` in `lib/subscriptions/entitlements.ts` returns `true` if `status === 'active'` OR (`status === 'trial'` AND `trial_ends_at > now()`).

### `user_progress`
1:1 with `users`. Tracks entry count for Tier 3 trigger.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | text FK | 1:1 with `users` |
| `total_entries` | int | Incremented via RPC on every entry create |
| `entry_count_at_last_progress` | int | Snapshot when Tier 3 last fired |
| `has_completed_onboarding` | bool | |

**RPCs:** `increment_entry_count(uid)`, `decrement_entry_count(uid)` — atomic, avoids race conditions.

---

## Domain: Entries & Insights

### `entries`
Core content table. Content is encrypted at rest.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | text FK | Clerk user ID |
| `encrypted_content` | text | AES-256-GCM encrypted entry text |
| `content_iv` | text | Encryption IV (base64) |
| `content_tag` | text | GCM auth tag (base64) |
| `word_count` | int | Computed on save |
| `embedding` | vector | OpenAI text-embedding-3-small (1536 dims) |
| `source_type` | text | `pattern` or `progress` (if entry created from a reflection) |
| `source_id` | uuid | ID of the pattern or progress insight that prompted this entry |

### `entry_insights`
1:many with `entries`. Each insight generation creates a new row (Tier 1).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `entry_id` | uuid FK | |
| `user_id` | text FK | |
| `encrypted_content` | text | AES-256-GCM encrypted insight prose |
| `content_iv` / `content_tag` | text | Encryption fields |
| `tags` | text[] | Up to 3 insight tag codes (from `lib/constants/insight-tag-types.ts`) |
| `generation_order` | int | Ascending — latest insight = highest number |
| `content_before_length` | int | Entry length at time of generation (for regeneration logic) |

### `prompts`
AI-generated writing prompts shown to users before they start an entry.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | text FK | |
| `prompt_text` | text | Not encrypted |
| `entry_id` | uuid FK nullable | Set when user starts writing from this prompt |
| `is_used` | bool | Whether this prompt was accepted |

---

## Domain: Patterns & Progress

### `weekly_insights`
Container for a week's analysis. 1:many with `weekly_insight_patterns`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | text FK | |
| `week_start` | date | Monday of the analyzed week |
| `entry_ids` | uuid[] | Entries analyzed |

### `weekly_insight_patterns`
Individual pattern cards. All text fields encrypted.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `weekly_insight_id` | uuid FK | |
| `title` | text | Not encrypted |
| `pattern_type` | text | Code from `lib/constants/pattern-types.ts` |
| `encrypted_description` / `description_iv` / `description_tag` | text | |
| `encrypted_question` / `question_iv` / `question_tag` | text | Optional |
| `encrypted_suggested_experiment` / `suggested_experiment_iv` / `suggested_experiment_tag` | text | Optional |
| `evidence` | uuid[] | Entry IDs that support this pattern |
| `embedding` | vector | For semantic similarity search across patterns |
| `is_viewed` | bool | Tracks if user has seen this pattern |

### `progress_insights`
Tier 3 progress reports. Content encrypted.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | text FK | |
| `encrypted_content` | text | Full progress report JSON (AES-256-GCM) |
| `content_iv` / `content_tag` | text | |
| `recent_entry_ids` | uuid[] | The 15 entries analyzed |
| `related_past_entry_ids` | uuid[] | Semantically similar older entries |
| `key_entry_ids` | uuid[] | Entries the AI flagged as most significant |
| `is_viewed` | bool | |

---

## Domain: Feedback

### `feedback`
User-submitted feature requests and bug reports (threaded).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | text FK | |
| `title` | text | |
| `description` | text | |
| `category` | text | |
| `status` | text | `open`, `in_progress`, `completed`, `wont_do`, `rejected` |
| `upvotes` | int | |
| `parent_id` | uuid FK nullable | For comment threads |

### `feedback_items`
Public-facing feedback board (separate from internal `feedback` table).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `submitted_by` | text | |
| `title` / `description` | text | |
| `status` | enum `feedback_status` | |
| `is_approved` | bool | Admin moderation |
| `is_anonymous` | bool | |
| `admin_reply` / `admin_reply_at` | text / timestamptz | |
| `upvote_count` | int | |
| `fts` | tsvector | Full-text search index |

### `feedback_votes` / `feedback_upvotes`
Vote tracking tables (1 vote per user per item).

---

## Domain: Metadata

### `onboarding_previews`
Stores generated pattern/progress previews shown during onboarding.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | text | |
| `entry_id` | uuid FK | The first entry |
| `pattern` | jsonb | Simulated weekly pattern preview |
| `progress` | jsonb | Simulated progress preview |

### `payment_events`
Idempotent log of Lemon Squeezy webhook events.

| Column | Type | Notes |
|--------|------|-------|
| `lemon_event_id` | text | Unique, used for idempotency check |
| `event_type` | text | e.g. `subscription_created` |
| `payload` | jsonb | Raw event payload |
| `processed_at` | timestamptz | Null until processed |

### `waitlist`
Pre-launch email capture. `email`, `source` only.

### `rate_limit_events`
Durable rate-limit audit records for public/user-facing write guards.
Stores `scope`, hashed key, and timestamp only; raw IP addresses and user IDs
are never stored.

---

## Key RPCs (Postgres Functions)

| Function | Args | Purpose |
|----------|------|---------|
| `increment_entry_count(uid)` | user_id | Atomically increments `user_progress.total_entries` |
| `decrement_entry_count(uid)` | user_id | Atomically decrements on entry delete |
| `search_entries_by_embedding(query_embedding, match_count, match_threshold, user_id_param)` | — | pgvector similarity search on entries |
| `find_related_entries(entry_id_param, user_id_param, match_count, match_threshold)` | — | Finds entries similar to a given entry |
| `get_weekly_insights_with_evidence(p_cursor, p_limit)` | — | Paginated weekly insights with patterns joined |
| `search_weekly_insight_patterns(query_embedding, ...)` | — | Similarity search on pattern embeddings |

---

## Migration Workflow

New migration file → apply locally → regenerate types → test → push when PR merged.

```bash
# Apply locally
npx supabase migration up

# Regenerate types
npx supabase gen types typescript --local > types/database.ts

# Push to production (only after code is merged)
npx supabase db push
```

Migration naming: `YYYYMMDDHHMMSS_description.sql`
