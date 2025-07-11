CREATE TABLE IF NOT EXISTS ticket_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER DEFAULT NULL,
  event_id INTEGER DEFAULT NULL,
  terminal_id INTEGER NOT NULL,
  code VARCHAR(50) DEFAULT NULL,
  access_date DATETIME DEFAULT NULL,
  access_action_id INTEGER DEFAULT NULL,
  spin VARCHAR(5) DEFAULT NULL,
  FOREIGN KEY (ticket_id) REFERENCES ticket (id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE,
  FOREIGN KEY (terminal_id) REFERENCES terminal (id) ON DELETE CASCADE,
  FOREIGN KEY (access_action_id) REFERENCES access_action (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_access_ticket_id ON ticket_access (ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_access_event_id ON ticket_access (event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_access_terminal_id ON ticket_access (terminal_id);
CREATE INDEX IF NOT EXISTS idx_ticket_access_access_action_id ON ticket_access (access_action_id);
CREATE INDEX IF NOT EXISTS idx_ticket_access_code ON ticket_access (code);
CREATE INDEX IF NOT EXISTS idx_ticket_access_access_date ON ticket_access (access_date); 