-- Criar tabela services para controle de processos/jobs
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped',
    started_at DATETIME DEFAULT NULL,
    stopped_at DATETIME DEFAULT NULL,
    parameters TEXT DEFAULT NULL,
    memory_usage BIGINT DEFAULT 0,
    cpu_usage FLOAT DEFAULT 0,
    last_activity DATETIME DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_last_activity ON services(last_activity); 