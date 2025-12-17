-- RLS uses auth.jwt()->>'sub' which contains the Clerk user ID.
-- Enable pgvector for semantic search
create extension if not exists vector with schema extensions;

-- USERS TABLE
create table public.users (
    id uuid primary key default gen_random_uuid(),
    user_id text unique not null,
    email text not null,
    subscription_status text not null default 'trial' check (
        subscription_status in ('trial', 'active', 'expired', 'cancelled')
    ),
    trial_started_at timestamptz default now(),
    trial_ends_at timestamptz default (now() + interval '7 days'),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index users_user_id_idx on public.users(user_id);

-- ENTRIES TABLE
create table public.entries (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public.users(user_id) on delete cascade,
    content text not null,
    word_count integer not null default 0,
    embedding vector(1536),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index entries_user_created_idx on public.entries(user_id, created_at desc);

create index entries_embedding_idx on public.entries using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- INSIGHTS TABLE
create table public.insights (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public.users(user_id) on delete cascade,
    entry_id uuid references public.entries(id) on delete cascade,
    tier integer not null check (tier in (1, 2, 3)),
    content jsonb not null,
    related_entry_ids uuid [] default '{}',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index insights_user_tier_idx on public.insights(user_id, tier, created_at desc);

create index insights_entry_id_idx on public.insights(entry_id)
where
    entry_id is not null;

-- PROMPTS TABLE
create table public.prompts (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public.users(user_id) on delete cascade,
    prompt_text text not null,
    is_used boolean default false,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index prompts_user_unused_idx on public.prompts(user_id, is_used, created_at desc);

-- USER_PROGRESS TABLE
create table public.user_progress (
    user_id text primary key references public.users(user_id) on delete cascade,
    total_entries integer default 0 not null,
    entry_count_at_last_tier3 integer default 0 not null,
    updated_at timestamptz default now() not null
);

-- UPDATED_AT TRIGGER
create or replace function public.update_updated_at() returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger users_updated_at before
update
    on public.users for each row execute function public.update_updated_at();

create trigger entries_updated_at before
update
    on public.entries for each row execute function public.update_updated_at();

create trigger insights_updated_at before
update
    on public.insights for each row execute function public.update_updated_at();

create trigger prompts_updated_at before
update
    on public.prompts for each row execute function public.update_updated_at();

create trigger user_progress_updated_at before
update
    on public.user_progress for each row execute function public.update_updated_at();

-- ROW LEVEL SECURITY (RLS)
alter table
    public.users enable row level security;

alter table
    public.entries enable row level security;

alter table
    public.insights enable row level security;

alter table
    public.prompts enable row level security;

alter table
    public.user_progress enable row level security;

-- USERS
create policy "Users can view own profile" on public.users for
select
    using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can update own profile" on public.users for
update
    using (auth.jwt() ->> 'sub' = user_id);

-- ENTRIES
create policy "Users can view own entries" on public.entries for
select
    using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can create own entries" on public.entries for
insert
    with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users can update own entries" on public.entries for
update
    using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can delete own entries" on public.entries for delete using (auth.jwt() ->> 'sub' = user_id);

-- INSIGHTS (read-only for users, created by system)
create policy "Users can view own insights" on public.insights for
select
    using (auth.jwt() ->> 'sub' = user_id);

-- PROMPTS
create policy "Users can view own prompts" on public.prompts for
select
    using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can update own prompts" on public.prompts for
update
    using (auth.jwt() ->> 'sub' = user_id);

-- USER_PROGRESS (read-only for users, updated by system)
create policy "Users can view own progress" on public.user_progress for
select
    using (auth.jwt() ->> 'sub' = user_id);