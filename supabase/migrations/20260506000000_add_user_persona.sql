CREATE TYPE persona_q1_answer AS ENUM (
    'never_tried', 'drifted_away', 'sometimes', 'regular_habit'
);
CREATE TYPE persona_q2_answer AS ENUM (
    'steady', 'bit_lost', 'overwhelmed', 'quietly_okay'
);
CREATE TYPE persona_q3_answer AS ENUM (
    'self_understanding', 'processing', 'pattern_awareness', 'safe_space'
);
CREATE TYPE persona_q4_answer AS ENUM (
    'relationships', 'work_projects', 'identity_direction', 'everything'
);

CREATE TABLE IF NOT EXISTS user_persona (
  user_id      TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  q1_answer    persona_q1_answer NOT NULL,
  q2_answer    persona_q2_answer NOT NULL,
  q3_answer    persona_q3_answer NOT NULL,
  q4_answer    persona_q4_answer NOT NULL,
  summary      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_persona ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own persona"
  ON user_persona FOR SELECT
  USING (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "users can insert own persona"
  ON user_persona FOR INSERT
  WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));

CREATE POLICY "users can update own persona"
  ON user_persona FOR UPDATE
  USING (user_id = (select auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (select auth.jwt() ->> 'sub'));
