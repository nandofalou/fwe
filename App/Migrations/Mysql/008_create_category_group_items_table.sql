CREATE TABLE `category_group_items` (
  `category_group_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  UNIQUE KEY `uq` (`category_group_id`,`category_id`),
  KEY `category_group_id` (`category_group_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `category_group_items_fk1` FOREIGN KEY (`category_group_id`) REFERENCES `category_group` (`id`) ON DELETE CASCADE,
  CONSTRAINT `category_group_items_fk2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;