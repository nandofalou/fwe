CREATE TABLE IF NOT EXISTS terminal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pin VARCHAR(4) DEFAULT NULL,
  ip VARCHAR(20) DEFAULT NULL,
  model VARCHAR(50) DEFAULT NULL,
  name VARCHAR(50) DEFAULT NULL,
  plataform VARCHAR(50) DEFAULT NULL,
  category_group_id INTEGER DEFAULT NULL,
  active TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (category_group_id) REFERENCES category_group (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_terminal_category_group_id ON terminal (category_group_id);
CREATE INDEX IF NOT EXISTS idx_terminal_pin ON terminal (pin);
CREATE INDEX IF NOT EXISTS idx_terminal_ip ON terminal (ip);
CREATE INDEX IF NOT EXISTS idx_terminal_name ON terminal (name);
CREATE INDEX IF NOT EXISTS idx_terminal_plataform ON terminal (plataform); 