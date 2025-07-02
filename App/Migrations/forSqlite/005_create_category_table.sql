CREATE TABLE `category` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `code` INTEGER,
  `name` TEXT,
  `multiplo` INTEGER DEFAULT 1,
  `fluxo` INTEGER NOT NULL DEFAULT 0,
  `external_id` INTEGER,
  `type` TEXT NOT NULL DEFAULT 'CREDENCIADO' CHECK (`type` IN ('TICKET','CREDENCIADO','COLABORADOR'))
);

CREATE INDEX `idx_category_name` ON `category` (`name`);
CREATE INDEX `idx_category_code` ON `category` (`code`); 