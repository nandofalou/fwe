CREATE TABLE `category` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` int(10) unsigned DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `multiplo` tinyint(1) DEFAULT 1,
  `fluxo` tinyint(1) NOT NULL DEFAULT 0,
  `external_id` int(10) DEFAULT NULL,
  `type` enum('TICKET','CREDENCIADO','COLABORADOR') NOT NULL DEFAULT 'CREDENCIADO',
  PRIMARY KEY (`id`),
  KEY `category` (`name`),
  KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 