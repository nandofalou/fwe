CREATE TABLE IF NOT EXISTS ticket_delivery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER DEFAULT NULL,
  event_id INTEGER DEFAULT NULL,
  terminal_id INTEGER DEFAULT NULL,
  access_action_id INTEGER DEFAULT NULL,
  code VARCHAR(50) DEFAULT NULL,
  access_date DATETIME DEFAULT NULL,
  spin VARCHAR(5) DEFAULT NULL,
  FOREIGN KEY (ticket_id) REFERENCES ticket (id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE,
  FOREIGN KEY (terminal_id) REFERENCES terminal (id) ON DELETE CASCADE,
  FOREIGN KEY (access_action_id) REFERENCES access_action (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_delivery_ticket_id ON ticket_delivery (ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_delivery_event_id ON ticket_delivery (event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_delivery_terminal_id ON ticket_delivery (terminal_id);
CREATE INDEX IF NOT EXISTS idx_ticket_delivery_access_action_id ON ticket_delivery (access_action_id);
CREATE INDEX IF NOT EXISTS idx_ticket_delivery_code ON ticket_delivery (code);
CREATE INDEX IF NOT EXISTS idx_ticket_delivery_access_date ON ticket_delivery (access_date); 