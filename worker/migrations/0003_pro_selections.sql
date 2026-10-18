-- Account-level PRO selections for the ¥480 plan.
-- Safe to run repeatedly; no existing tables or rows are removed.
CREATE TABLE IF NOT EXISTS pro_selections (
  clerk_user_id TEXT PRIMARY KEY,
  tool_ids_json TEXT NOT NULL DEFAULT '[]',
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id)
);
