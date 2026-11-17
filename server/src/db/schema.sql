-- Club Hub database schema (Sprint 1)
-- Matches the USERS table in docs/er-diagram.png.
-- CLUBS and MEMBERSHIPS get added in the CH2-CH4 branch.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,               -- unique number for each user
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(254) NOT NULL UNIQUE,     -- UNIQUE stops two accounts with the same email
  password_hash VARCHAR(100) NOT NULL,            -- bcrypt hash, never the real password
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
