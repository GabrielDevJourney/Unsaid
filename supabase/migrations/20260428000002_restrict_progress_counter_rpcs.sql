-- Revoke default PUBLIC execute on progress counter RPCs.
-- These functions are SECURITY DEFINER and accept arbitrary uid — they must
-- only be callable from the service role (lib/entries/repo.ts via admin client).
REVOKE ALL ON FUNCTION increment_entry_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_entry_count(text) TO service_role;

REVOKE ALL ON FUNCTION decrement_entry_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION decrement_entry_count(text) TO service_role;
