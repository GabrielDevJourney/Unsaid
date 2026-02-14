ALTER TABLE public.users
    ADD COLUMN username text UNIQUE NOT NULL;

