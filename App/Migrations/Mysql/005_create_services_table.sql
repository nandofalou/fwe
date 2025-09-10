-- Criar tabela services para controle de processos/jobs
CREATE TABLE IF NOT EXISTS services (
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    status ENUM('running', 'stopped', 'error', 'paused') DEFAULT 'stopped',
    started_at DATETIME DEFAULT NULL,
    stopped_at DATETIME DEFAULT NULL,
    parameters TEXT DEFAULT NULL,
    memory_usage BIGINT DEFAULT 0,
    cpu_usage DECIMAL(10,2) DEFAULT 0.00,
    last_activity DATETIME DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para melhor performance
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_last_activity ON services(last_activity);
