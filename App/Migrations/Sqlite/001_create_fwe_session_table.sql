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