-- Drop pg_graphql extension — Unsaid uses PostgREST (REST API) only, not GraphQL.
-- This removes all 18-table GraphQL schema exposure warnings in one shot.
-- CASCADE drops the dependent graphql and graphql_public schemas automatically.
DROP EXTENSION IF EXISTS pg_graphql CASCADE;

-- sync_entry_count is a trigger function invoked by trg_sync_entry_count.
-- No external role should be able to call it directly via REST or GraphQL.
REVOKE EXECUTE ON FUNCTION public.sync_entry_count() FROM PUBLIC, anon, authenticated;
