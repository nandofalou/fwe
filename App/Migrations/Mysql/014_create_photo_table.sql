CREATE TABLE `photo` (
  `ticket_id` int(10) unsigned NOT NULL,
  `image` longtext DEFAULT NULL,
  `image_url` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  UNIQUE KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `fk_photo_ticket_id` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;