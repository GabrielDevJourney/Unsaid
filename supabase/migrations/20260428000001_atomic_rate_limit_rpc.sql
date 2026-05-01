-- Atomic rate-limit check + insert using an advisory lock.
-- Eliminates the TOCTOU race between countRateLimitEventsSince and
-- createRateLimitEvent: two concurrent requests for the same key are
-- serialised, so exactly `limit` events can be inserted per window.
CREATE OR REPLACE FUNCTION try_consume_rate_limit(
    p_scope text,
    p_key_hash text,
    p_since timestamptz,
    p_limit int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count int;
    v_lock_id bigint;
BEGIN
    -- Derive a deterministic advisory lock ID from the rate-limit key.
    -- pg_advisory_xact_lock serialises concurrent requests for the same
    -- (scope, key_hash) pair; the lock is released at transaction end.
    v_lock_id := ('x' || substr(md5(p_scope || ':' || p_key_hash), 1, 16))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_id);

    SELECT COUNT(*) INTO v_count
    FROM rate_limit_events
    WHERE scope = p_scope AND key_hash = p_key_hash AND created_at > p_since;

    IF v_count >= p_limit THEN
        RETURN false;
    END IF;

    INSERT INTO rate_limit_events (scope, key_hash) VALUES (p_scope, p_key_hash);
    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION try_consume_rate_limit(text, text, timestamptz, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION try_consume_rate_limit(text, text, timestamptz, int) TO service_role;
