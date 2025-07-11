CREATE TABLE IF NOT EXISTS access_action (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(20) NOT NULL,
  description VARCHAR(100) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_access_action_name ON access_action (name); 