CREATE TABLE IF NOT EXISTS ticket (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER DEFAULT NULL,
  user_id INTEGER DEFAULT NULL,
  category_id INTEGER DEFAULT NULL,
  ticket_source_event_id INTEGER DEFAULT NULL,
  code VARCHAR(100) DEFAULT NULL,
  fullname VARCHAR(50) DEFAULT NULL,
  email VARCHAR(50) DEFAULT NULL,
  documentId VARCHAR(255) DEFAULT NULL,
  extrafield1 VARCHAR(255) DEFAULT NULL,
  extrafield2 VARCHAR(255) DEFAULT NULL,
  active TINYINT NOT NULL DEFAULT 0,
  master TINYINT NOT NULL DEFAULT 0,
  accredited_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE(event_id, code),
  FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (ticket_source_event_id) REFERENCES ticket_source_event (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_ticket_category_id ON ticket (category_id);
CREATE INDEX IF NOT EXISTS idx_ticket_ticket_source_event_id ON ticket (ticket_source_event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_code ON ticket (code);
CREATE INDEX IF NOT EXISTS idx_ticket_fullname ON ticket (fullname);
CREATE INDEX IF NOT EXISTS idx_ticket_event_id ON ticket (event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_user_id ON ticket (user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_email ON ticket (email);
CREATE INDEX IF NOT EXISTS idx_ticket_documentId ON ticket (documentId);
CREATE INDEX IF NOT EXISTS idx_ticket_extrafield1 ON ticket (extrafield1);
CREATE INDEX IF NOT EXISTS idx_ticket_extrafield2 ON ticket (extrafield2); 