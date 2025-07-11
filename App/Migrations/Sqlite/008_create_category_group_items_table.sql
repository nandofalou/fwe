CREATE TABLE IF NOT EXISTS category_group_items (
  category_group_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  UNIQUE(category_group_id, category_id),
  FOREIGN KEY (category_group_id) REFERENCES category_group (id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_category_group_items_category_group_id ON category_group_items (category_group_id);
CREATE INDEX IF NOT EXISTS idx_category_group_items_category_id ON category_group_items (category_id); 