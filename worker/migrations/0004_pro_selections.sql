-- PRO entitlement selection is authoritative in D1, not browser localStorage.
-- One row per Clerk identity; atomic compare-and-swap prevents lost updates across tabs/devices.
CREATE TABLE IF NOT EXISTS pro_selections (
  clerk_user_id TEXT PRIMARY KEY REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  tool_ids_json TEXT NOT NULL DEFAULT '[]',
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
