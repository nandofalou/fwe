CREATE TABLE IF NOT EXISTS event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL,
  name VARCHAR(100) DEFAULT NULL,
  startdate DATETIME DEFAULT NULL,
  enddate DATETIME DEFAULT NULL,
  active TINYINT NOT NULL DEFAULT 0,
  local TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_event_created_by ON event (created_by);
CREATE INDEX IF NOT EXISTS idx_name ON event (name);
CREATE INDEX IF NOT EXISTS idx_startdate ON event (startdate);
CREATE INDEX IF NOT EXISTS idx_enddate ON event (enddate);
CREATE INDEX IF NOT EXISTS idx_period ON event (startdate, enddate);
CREATE INDEX IF NOT EXISTS idx_active ON event (active);
CREATE INDEX IF NOT EXISTS idx_local ON event (local);
CREATE INDEX IF NOT EXISTS idx_created_at ON event (created_at);
CREATE INDEX IF NOT EXISTS idx_updated_at ON event (updated_at);
CREATE INDEX IF NOT EXISTS idx_deleted_at ON event (deleted_at); 