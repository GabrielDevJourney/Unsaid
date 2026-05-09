-- Encrypt persona summary at rest (AES-256-GCM, same pattern as entries/entry_insights)
ALTER TABLE user_persona
    ADD COLUMN encrypted_summary text,
    ADD COLUMN summary_iv        text,
    ADD COLUMN summary_tag       text;

-- Nullify any existing plaintext values — dev/test only, no prod data yet
UPDATE user_persona
SET encrypted_summary = NULL,
    summary_iv        = NULL,
    summary_tag       = NULL;

ALTER TABLE user_persona DROP COLUMN summary;
