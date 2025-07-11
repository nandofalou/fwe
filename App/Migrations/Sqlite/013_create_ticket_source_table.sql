CREATE TABLE IF NOT EXISTS ticket_source (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL,
  description VARCHAR(255) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_ticket_source_name ON ticket_source (name); 