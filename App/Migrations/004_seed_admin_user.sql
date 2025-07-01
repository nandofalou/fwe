INSERT OR IGNORE INTO users (email, name, pass, active, permission_id)
SELECT 'admin@admin.com', 'Administrador', '$2b$10$hashficticio', 1, id FROM permission WHERE name = 'MASTER';
-- Substitua o hash por um hash real de senha se necessário 