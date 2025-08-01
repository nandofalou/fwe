CREATE TABLE `ticket_source_event` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` int(10) UNSIGNED NOT NULL,
  `ticket_source_id` int(10) UNSIGNED NOT NULL,
  `token` varchar(200) DEFAULT NULL,
  `identify` varchar(200) DEFAULT NULL,
  `params` varchar(45) DEFAULT NULL,
  `lastUpdate` datetime DEFAULT NULL,
  `startSync` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_ticket_source_id` (`ticket_source_id`),
  KEY `idx_token` (`token`),
  CONSTRAINT `fk_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ticket_source_id` FOREIGN KEY (`ticket_source_id`) REFERENCES `ticket_source` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;