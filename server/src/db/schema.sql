-- Club Hub database schema (Sprint 1)
-- Matches the USERS, CLUBS and MEMBERSHIPS tables in docs/er-diagram.png.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY, -- unique number for each user
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(254) NOT NULL UNIQUE, -- UNIQUE stops two accounts with the same email
  password_hash VARCHAR(100) NOT NULL, -- bcrypt hash, never the real password
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CLUBS and MEMBERSHIPS (added for CH4, used by CH2 and CH3)
CREATE TABLE IF NOT EXISTS clubs (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE, -- no two clubs with the same name
  description VARCHAR(500) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role    VARCHAR(20) NOT NULL DEFAULT 'member'
          CHECK (role IN ('owner', 'officer', 'member')),
  PRIMARY KEY (user_id, club_id) -- a user can only join a club once
);
