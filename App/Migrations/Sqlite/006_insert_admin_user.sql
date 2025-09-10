-- Inserir usuário administrador padrão
INSERT OR IGNORE INTO users (
    email,
    name,
    pass,
    active,
    permission_id,
    hash,
    hash_date_validate,
    created_at,
    updated_at,
    deleted_at
) VALUES (
    'admin@admin.com',
    'Administrador',
    '$2a$10$Ww.QVfVZ/GvOImxE9oxUh.qEhBcnP6A72FJ3RxmX1ZmFuEim1GGMm',
    1,
    1,
    NULL,
    NULL,
    '2025-09-09 01:40:16',
    '2025-09-09 01:40:16',
    NULL
);
