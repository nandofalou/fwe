# Sistema de Migrations

Este documento descreve o sistema de migrations do framework FWE, que permite gerenciar a estrutura do banco de dados de forma versionada e controlada.

---

## 📋 Visão Geral

O sistema de migrations permite:
- **Versionamento**: Controle de versões da estrutura do banco
- **Compatibilidade**: Suporte a SQLite e MySQL
- **Execução Automática**: Aplicação automática das migrations
- **Rollback**: Possibilidade de reverter alterações

---

## 📁 Estrutura de Arquivos

### Diretórios de Migrations
```
App/Migrations/
├── Sqlite/                    # Migrations para SQLite
│   ├── 001_create_fwe_session_table.sql
│   ├── 002_create_permission_table.sql
│   ├── 003_seed_permissions.sql
│   ├── 004_create_users_table.sql
│   ├── 005_create_services_table.sql
│   └── 006_insert_admin_user.sql
└── Mysql/                     # Migrations para MySQL
    ├── 001_create_fwe_session_table.sql
    ├── 002_create_permission_table.sql
    ├── 003_seed_permissions.sql
    ├── 004_create_users_table.sql
    ├── 005_create_services_table.sql
    └── 006_insert_admin_user.sql
```

### Convenção de Nomenclatura
- **Formato**: `NNN_descricao_da_migration.sql`
- **Numeração**: Sequencial com 3 dígitos (001, 002, 003...)
- **Descrição**: Nome descritivo em snake_case

---

## 🗄️ Migrations Disponíveis

### 001 - Tabela de Sessões
**Arquivo**: `001_create_fwe_session_table.sql`

**SQLite:**
```sql
CREATE TABLE fwe_session (
    id TEXT PRIMARY KEY,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    user_id INTEGER NULL,
    data TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);
```

**MySQL:**
```sql
CREATE TABLE fwe_session (
    id VARCHAR(128) PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255) NOT NULL,
    user_id INT UNSIGNED NULL,
    data TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 002 - Tabela de Permissões
**Arquivo**: `002_create_permission_table.sql`

**SQLite:**
```sql
CREATE TABLE IF NOT EXISTS permission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(20) NOT NULL,
    description VARCHAR(255) DEFAULT NULL
);
```

**MySQL:**
```sql
CREATE TABLE IF NOT EXISTS permission (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 003 - Seed de Permissões
**Arquivo**: `003_seed_permissions.sql`

**SQLite:**
```sql
INSERT OR IGNORE INTO permission (name, description) VALUES ('MASTER', 'Permissão total');
INSERT OR IGNORE INTO permission (name, description) VALUES ('EDITOR', 'Permite edição de cadastro e visualização');
INSERT OR IGNORE INTO permission (name, description) VALUES ('VIEW', 'Permite visualização');
```

**MySQL:**
```sql
INSERT IGNORE INTO permission (name, description) VALUES ('MASTER', 'Permissão total');
INSERT IGNORE INTO permission (name, description) VALUES ('EDITOR', 'Permite edição de cadastro e visualização');
INSERT IGNORE INTO permission (name, description) VALUES ('VIEW', 'Permite visualização');
```

### 004 - Tabela de Usuários
**Arquivo**: `004_create_users_table.sql`

**SQLite:**
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    pass TEXT DEFAULT NULL,
    active TINYINT NOT NULL DEFAULT 0,
    permission_id INTEGER NOT NULL,
    hash TEXT DEFAULT NULL,
    hash_date_validate DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

**MySQL:**
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    pass TEXT DEFAULT NULL,
    active TINYINT(1) NOT NULL DEFAULT 0,
    permission_id INT(10) UNSIGNED NOT NULL,
    hash TEXT DEFAULT NULL,
    hash_date_validate DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 005 - Tabela de Serviços
**Arquivo**: `005_create_services_table.sql`

**SQLite:**
```sql
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

CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_last_activity ON services(last_activity);
```

**MySQL:**
```sql
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

CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_last_activity ON services(last_activity);
```

### 006 - Usuário Administrador
**Arquivo**: `006_insert_admin_user.sql`

**SQLite:**
```sql
INSERT OR IGNORE INTO users (
    email, name, pass, active, permission_id, hash, hash_date_validate, created_at, updated_at, deleted_at
) VALUES (
    'admin@admin.com', 'Administrador', '$2a$10$Ww.QVfVZ/GvOImxE9oxUh.qEhBcnP6A72FJ3RxmX1ZmFuEim1GGMm', 1, 1, NULL, NULL, '2025-09-09 01:40:16', '2025-09-09 01:40:16', NULL
);
```

**MySQL:**
```sql
INSERT IGNORE INTO users (
    email, name, pass, active, permission_id, hash, hash_date_validate, created_at, updated_at, deleted_at
) VALUES (
    'admin@admin.com', 'Administrador', '$2a$10$Ww.QVfVZ/GvOImxE9oxUh.qEhBcnP6A72FJ3RxmX1ZmFuEim1GGMm', 1, 1, NULL, NULL, '2025-09-09 01:40:16', '2025-09-09 01:40:16', NULL
);
```

---

## 🔧 Execução das Migrations

### Execução Automática
As migrations são executadas automaticamente na inicialização do sistema:
1. **Detecção**: Sistema detecta o driver do banco (SQLite/MySQL)
2. **Verificação**: Verifica quais migrations já foram aplicadas
3. **Execução**: Aplica apenas as migrations pendentes
4. **Log**: Registra o progresso no log do sistema

### Log de Execução
```
Migration 001_create_fwe_session_table.sql aplicada.
Migration 002_create_permission_table.sql aplicada.
Migration 003_seed_permissions.sql aplicada.
Migration 004_create_users_table.sql aplicada.
Migration 005_create_services_table.sql aplicada.
Migration 006_insert_admin_user.sql aplicada.
Todas as migrations estão atualizadas.
```

---

## 📊 Estrutura do Banco

### Tabelas Principais

#### **fwe_session**
- **Propósito**: Gerenciamento de sessões de usuário
- **Campos**: id, ip_address, user_agent, user_id, data, timestamps, expires_at

#### **permission**
- **Propósito**: Controle de permissões do sistema
- **Campos**: id, name, description
- **Valores**: MASTER, EDITOR, VIEW

#### **users**
- **Propósito**: Cadastro de usuários
- **Campos**: id, email, name, pass, active, permission_id, hash, timestamps
- **Relacionamento**: Foreign key para permission

#### **services**
- **Propósito**: Controle de processos/jobs
- **Campos**: id, name, status, timestamps, parameters, usage, error_message

---

## 🔒 Segurança

### Usuário Administrador
- **Email**: admin@admin.com
- **Senha**: Hash bcrypt ($2a$10$...)
- **Permissão**: MASTER (permission_id = 1)
- **Status**: Ativo por padrão

### Boas Práticas
- **Senhas**: Sempre usar hash bcrypt
- **Permissões**: Implementar controle de acesso baseado em roles
- **Sessões**: Configurar expiração adequada
- **Logs**: Monitorar tentativas de acesso

---

## 🚀 Criando Novas Migrations

### Passos para Nova Migration

1. **Criar Arquivo SQLite**:
   ```sql
   -- App/Migrations/Sqlite/007_nova_funcionalidade.sql
   CREATE TABLE IF NOT EXISTS nova_tabela (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       campo VARCHAR(255) NOT NULL,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Criar Arquivo MySQL**:
   ```sql
   -- App/Migrations/Mysql/007_nova_funcionalidade.sql
   CREATE TABLE IF NOT EXISTS nova_tabela (
       id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
       campo VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
   ```

3. **Testar**: Executar a aplicação para verificar se a migration é aplicada

### Convenções Importantes
- **Compatibilidade**: Manter compatibilidade entre SQLite e MySQL
- **Índices**: Adicionar índices para campos frequentemente consultados
- **Constraints**: Usar foreign keys quando apropriado
- **Valores Padrão**: Definir valores padrão sensatos

---

## 📚 Recursos Adicionais

### Documentação Relacionada
- [config_ini.md](./config_ini.md) - Configurações do banco
- [guia_crud.md](./guia_crud.md) - Operações CRUD
- [querybuilder.md](./querybuilder.md) - Query Builder

### Ferramentas
- **SQLite Browser**: Para visualizar banco SQLite
- **phpMyAdmin**: Para gerenciar MySQL
- **Logs**: Monitorar execução das migrations

---

Mantenha as migrations organizadas e documentadas para facilitar a manutenção!
