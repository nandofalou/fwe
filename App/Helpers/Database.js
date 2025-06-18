const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const fs = require('fs');
const Config = require('./Config');
const Event = require('./Event');

/**
 * Classe para manipulação de banco de dados
 */
const Database = {
    connection: null,
    config: Config,
    type: Config.get('database.type', 'sqlite'),
    connections: new Map(),
    event: Event,

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                // Criar diretório se não existir
                const dbDir = path.join(os.homedir(), 'fwe');
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                const dbPath = this.config.database.sqlite.path;
                this.connection = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error('Erro ao conectar ao banco de dados:', err);
                        reject(err);
                    } else {
                        console.log('Conectado ao banco de dados SQLite');
                        this.createTables().then(resolve).catch(reject);
                    }
                });
            } catch (error) {
                console.error('Erro ao inicializar banco de dados:', error);
                reject(error);
            }
        });
    },

    async createTables() {
        return new Promise((resolve, reject) => {
            this.connection.serialize(() => {
                // Tabela de usuários
                this.connection.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        avatar TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Tabela de tokens
                this.connection.run(`
                    CREATE TABLE IF NOT EXISTS tokens (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        token TEXT NOT NULL,
                        type TEXT NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                `);

                resolve();
            });
        });
    },

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.connection.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    async execute(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.connection.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    },

    async close() {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    },

    /**
     * Desconecta de um banco de dados
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    disconnect(name) {
        return new Promise((resolve, reject) => {
            const db = this.connections.get(name);

            if (!db) {
                const err = new Error(`Conexão "${name}" não encontrada`);
                this.event.emit('database:error', err);
                reject(err);
                return;
            }

            db.close((err) => {
                if (err) {
                    this.event.emit('database:error', err);
                    reject(err);
                    return;
                }

                this.connections.delete(name);
                this.event.emit('database:disconnected', name);
                resolve();
            });
        });
    },

    /**
     * Insere um registro
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} data Dados
     * @returns {Promise<number>} ID do registro
     */
    insert(name, table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

        return new Promise((resolve, reject) => {
            const db = this.connections.get(name);

            if (!db) {
                const err = new Error(`Conexão "${name}" não encontrada`);
                this.event.emit('database:error', err);
                reject(err);
                return;
            }

            db.run(sql, values, function(err) {
                if (err) {
                    this.event.emit('database:error', err);
                    reject(err);
                    return;
                }

                this.event.emit('database:inserted', name, table, data, this.lastID);
                resolve(this.lastID);
            });
        });
    },

    /**
     * Atualiza registros
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} data Dados
     * @param {string} where Condição WHERE
     * @param {Array} params Parâmetros (opcional)
     * @returns {Promise<number>} Número de registros afetados
     */
    update(name, table, data, where, params = []) {
        const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...params];
        const sql = `UPDATE ${table} SET ${sets} WHERE ${where}`;

        return new Promise((resolve, reject) => {
            const db = this.connections.get(name);

            if (!db) {
                const err = new Error(`Conexão "${name}" não encontrada`);
                this.event.emit('database:error', err);
                reject(err);
                return;
            }

            db.run(sql, values, function(err) {
                if (err) {
                    this.event.emit('database:error', err);
                    reject(err);
                    return;
                }

                this.event.emit('database:updated', name, table, data, where, this.changes);
                resolve(this.changes);
            });
        });
    },

    /**
     * Remove registros
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {string} where Condição WHERE
     * @param {Array} params Parâmetros (opcional)
     * @returns {Promise<number>} Número de registros afetados
     */
    delete(name, table, where, params = []) {
        const sql = `DELETE FROM ${table} WHERE ${where}`;

        return new Promise((resolve, reject) => {
            const db = this.connections.get(name);

            if (!db) {
                const err = new Error(`Conexão "${name}" não encontrada`);
                this.event.emit('database:error', err);
                reject(err);
                return;
            }

            db.run(sql, params, function(err) {
                if (err) {
                    this.event.emit('database:error', err);
                    reject(err);
                    return;
                }

                this.event.emit('database:deleted', name, table, where, this.changes);
                resolve(this.changes);
            });
        });
    },

    /**
     * Inicia uma transação
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    beginTransaction(name) {
        return this.query(name, 'BEGIN TRANSACTION');
    },

    /**
     * Confirma uma transação
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    commit(name) {
        return this.query(name, 'COMMIT');
    },

    /**
     * Desfaz uma transação
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    rollback(name) {
        return this.query(name, 'ROLLBACK');
    },

    /**
     * Executa uma transação
     * @param {string} name Nome da conexão
     * @param {Function} callback Função de callback
     * @returns {Promise<*>} Resultado
     */
    async transaction(name, callback) {
        await this.beginTransaction(name);

        try {
            const result = await callback();
            await this.commit(name);
            return result;
        } catch (err) {
            await this.rollback(name);
            throw err;
        }
    },

    /**
     * Verifica se uma conexão existe
     * @param {string} name Nome da conexão
     * @returns {boolean} true se existir
     */
    hasConnection(name) {
        return this.connections.has(name);
    },

    /**
     * Obtém uma conexão
     * @param {string} name Nome da conexão
     * @returns {sqlite3.Database|null} Conexão
     */
    getConnection(name) {
        return this.connections.get(name) || null;
    },

    /**
     * Obtém todas as conexões
     * @returns {Map} Conexões
     */
    getConnections() {
        return this.connections;
    },

    /**
     * Fecha todas as conexões
     * @returns {Promise<void>}
     */
    async closeAll() {
        const promises = [];

        for (const [name] of this.connections) {
            promises.push(this.disconnect(name));
        }

        await Promise.all(promises);
    },

    /**
     * Executa uma query de seleção
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} conditions Condições (opcional)
     * @param {Object} options Opções (opcional)
     * @returns {Promise} Resultado da query
     */
    select(name, table, conditions = {}, options = {}) {
        const { columns = '*', orderBy, limit, offset } = options;
        let sql = `SELECT ${columns} FROM ${table}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const where = Object.entries(conditions)
                .map(([key, value]) => {
                    params.push(value);
                    return `${key} = ?`;
                })
                .join(' AND ');
            sql += ` WHERE ${where}`;
        }

        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        if (limit) {
            sql += ` LIMIT ${limit}`;
            if (offset) {
                sql += ` OFFSET ${offset}`;
            }
        }

        return this.query(name, sql, params);
    },

    /**
     * Executa uma query de inserção
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} data Dados
     * @returns {Promise} ID do registro inserido
     */
    insertInto(name, table, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        return this.insert(name, sql, values);
    },

    /**
     * Executa uma query de atualização
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} data Dados
     * @param {Object} conditions Condições
     * @returns {Promise} Número de registros afetados
     */
    updateWhere(name, table, data, conditions) {
        const set = Object.entries(data)
            .map(([key]) => `${key} = ?`)
            .join(', ');
        const where = Object.entries(conditions)
            .map(([key]) => `${key} = ?`)
            .join(' AND ');

        const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
        const params = [...Object.values(data), ...Object.values(conditions)];

        return this.update(name, sql, params);
    },

    /**
     * Executa uma query de exclusão
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} conditions Condições
     * @returns {Promise} Número de registros afetados
     */
    deleteWhere(name, table, conditions) {
        const where = Object.entries(conditions)
            .map(([key]) => `${key} = ?`)
            .join(' AND ');

        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const params = Object.values(conditions);

        return this.delete(name, sql, params);
    },

    /**
     * Executa uma query de contagem
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} conditions Condições (opcional)
     * @returns {Promise} Número de registros
     */
    count(name, table, conditions = {}) {
        let sql = `SELECT COUNT(*) as count FROM ${table}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const where = Object.entries(conditions)
                .map(([key, value]) => {
                    params.push(value);
                    return `${key} = ?`;
                })
                .join(' AND ');
            sql += ` WHERE ${where}`;
        }

        return this.query(name, sql, params).then(rows => rows[0].count);
    },

    /**
     * Executa uma query de existência
     * @param {string} name Nome da conexão
     * @param {string} table Nome da tabela
     * @param {Object} conditions Condições
     * @returns {Promise} true se existir
     */
    exists(name, table, conditions) {
        return this.count(name, table, conditions).then(count => count > 0);
    }
};

module.exports = Database; 