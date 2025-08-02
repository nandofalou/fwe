const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Config = require('../Config/Config');
const Event = require('./Event');

/**
 * Classe para manipulação de banco de dados
 */
const Database = {
    connection: null,
    config: Config,
    driver: (Config.database && Config.database.driver) ? Config.database.driver : 'sqlite',
    connections: new Map(),
    event: Event,
    
    // --- FILAS SEPARADAS POR PRIORIDADE ---
    criticalQueue: Promise.resolve(), // Para operações críticas (acesso, edição)
    batchQueue: Promise.resolve(),    // Para operações em lote (importação, geração)
    maxConcurrentBatch: 3,           // Máximo de operações em lote simultâneas
    activeBatchOperations: 0,

    async connect() {
        if (this.config.database.driver === 'mysql') {
            // MySQL
            const mysqlConfig = this.config.database.mysql;
            this.connection = await mysql.createConnection({
                host: mysqlConfig.host,
                user: mysqlConfig.user,
                password: mysqlConfig.password,
                database: mysqlConfig.database,
                port: mysqlConfig.port || 3306,
                charset: mysqlConfig.charset || 'utf8mb4'
            });
            console.log('Conectado ao banco de dados MySQL');
            return;
        }
        // SQLite (padrão)
        return new Promise((resolve, reject) => {
            try {
                // Criar diretório se não existir
                const dbDir = path.join(os.homedir(), 'fwe');
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                // Acessar configuração usando notação com ponto ou aninhada
                let dbPath = null;
                if (this.config.database && this.config.database.sqlite && this.config.database.sqlite.path) {
                    dbPath = this.config.database.sqlite.path;
                } else if (this.config.database && this.config.database['sqlite.path']) {
                    dbPath = this.config.database['sqlite.path'];
                }
                if (!dbPath) {
                    throw new Error('Caminho do banco de dados não configurado');
                }
                console.log('Usando banco de dados em:', dbPath);

                this.connection = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error('Erro ao conectar ao banco de dados:', err);
                        reject(err);
                    } else {
                        console.log('Conectado ao banco de dados SQLite');
                        resolve();
                    }
                });
            } catch (error) {
                console.error('Erro ao inicializar banco de dados:', error);
                reject(error);
            }
        });
    },

    // --- SISTEMA DE FILAS MELHORADO ---
    
    /**
     * Adiciona operação crítica à fila (alta prioridade)
     * Usado para: acesso, edição, operações que não podem esperar
     */
    enqueueCritical(operation) {
        this.criticalQueue = this.criticalQueue.then(operation).catch(err => {
            console.error("Erro na execução crítica do banco:", err);
            throw err;
        });
        return this.criticalQueue;
    },

    /**
     * Adiciona operação em lote à fila (baixa prioridade)
     * Usado para: importação, geração em massa
     */
    async enqueueBatch(operation) {
        // Aguarda se há muitas operações em lote ativas
        while (this.activeBatchOperations >= this.maxConcurrentBatch) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.activeBatchOperations++;
        
        try {
            this.batchQueue = this.batchQueue.then(async () => {
                try {
                    return await operation();
                } finally {
                    this.activeBatchOperations--;
                }
            }).catch(err => {
                this.activeBatchOperations--;
                console.error("Erro na execução em lote do banco:", err);
                throw err;
            });
            return this.batchQueue;
        } catch (error) {
            this.activeBatchOperations--;
            throw error;
        }
    },

    /**
     * Determina automaticamente se é operação crítica ou em lote
     */
    enqueue(operation, priority = 'auto') {
        if (priority === 'critical') {
            return this.enqueueCritical(operation);
        } else if (priority === 'batch') {
            return this.enqueueBatch(operation);
        } else {
            // Auto-detecta baseado no tipo de operação
            const operationStr = operation.toString();
            if (operationStr.includes('INSERT') || operationStr.includes('UPDATE') || operationStr.includes('DELETE')) {
                // Se for operação de modificação, usa fila crítica
                return this.enqueueCritical(operation);
            } else {
                // Se for consulta, usa fila crítica
                return this.enqueueCritical(operation);
            }
        }
    },

    async query(sql, params = [], priority = 'auto') {
        return this.enqueue(() => this._query(sql, params), priority);
    },

    /**
     * Insere um registro
     * @param {string} sql Query SQL
     * @param {Array} params Valores
     * @param {string} priority Prioridade da operação
     * @returns {Promise<number>} ID do registro
     */
    async insert(sql, params = [], priority = 'auto') {
        return this.enqueue(() => this._insert(sql, params), priority);
    },

    /**
     * Atualiza registros
     * @param {string} sql Query SQL
     * @param {Array} params Valores
     * @param {string} priority Prioridade da operação
     * @returns {Promise<number>} Número de registros afetados
     */
    async update(sql, params = [], priority = 'auto') {
        return this.enqueue(() => this._update(sql, params), priority);
    },

    /**
     * Remove registros
     * @param {string} sql Query SQL
     * @param {Array} params Valores
     * @param {string} priority Prioridade da operação
     * @returns {Promise<number>} Número de registros afetados
     */
    async delete(sql, params = [], priority = 'auto') {
        return this.enqueue(() => this._delete(sql, params), priority);
    },

    // --- Métodos reais (privados) ---
    _query(sql, params) {
        if (this.driver === 'mysql') {
            return this.connection.execute(sql, params);
        } else {
            return new Promise((resolve, reject) => {
                this.connection.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }
    },

    _insert(sql, params) {
        if (this.driver === 'mysql') {
            return this.connection.execute(sql, params);
        } else {
            return new Promise((resolve, reject) => {
                this.connection.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        }
    },

    _update(sql, params) {
        return this._insert(sql, params);
    },

    _delete(sql, params) {
        return this._insert(sql, params);
    },

    async execute(sql, params = []) {
        if (this.config.database.driver === 'mysql') {
            const [result] = await this.connection.execute(sql, params);
            return result;
        }
        // SQLite
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
     * Inicia uma transação
     */
    async beginTransaction() {
        if (this.config.database.driver === 'mysql') {
            await this.connection.beginTransaction();
        } else {
            await this.query('BEGIN TRANSACTION');
        }
    },
    async commit() {
        if (this.config.database.driver === 'mysql') {
            await this.connection.commit();
        } else {
            await this.query('COMMIT');
        }
    },
    async rollback() {
        if (this.config.database.driver === 'mysql') {
            await this.connection.rollback();
        } else {
            await this.query('ROLLBACK');
        }
    },

    /**
     * Executa uma transação
     * @param {Function} callback Função de callback
     * @param {string} priority Prioridade da transação
     * @returns {Promise<*>} Resultado
     */
    async transaction(callback, priority = 'auto') {
        return this.enqueue(async () => {
            await this.beginTransaction();
            try {
                const result = await callback();
                await this.commit();
                return result;
            } catch (err) {
                await this.rollback();
                throw err;
            }
        }, priority);
    },

    /**
     * Executa uma transação em lote (para importação/geração)
     * @param {Function} callback Função de callback
     * @returns {Promise<*>} Resultado
     */
    async batchTransaction(callback) {
        return this.enqueueBatch(async () => {
            await this.beginTransaction();
            try {
                const result = await callback();
                await this.commit();
                return result;
            } catch (err) {
                await this.rollback();
                throw err;
            }
        });
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
    },

    /**
     * Executa as migrations localizadas em App/Migrations/Mysql ou App/Migrations/Sqlite
     */
    async runMigrations() {
        const isMySQL = this.config.database.driver === 'mysql';
        const migrationsDir = path.join(__dirname, isMySQL ? '../Migrations/Mysql' : '../Migrations/Sqlite');
        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }
        // Cria tabela de controle
        if (isMySQL) {
            await this.connection.execute(`CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                run_on DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        } else {
            await new Promise((resolve, reject) => {
                this.connection.run(`CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    run_on DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, err => err ? reject(err) : resolve());
            });
        }
        // Lê arquivos .sql
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
        for (const file of files) {
            let already;
            if (isMySQL) {
                const [rows] = await this.connection.execute('SELECT 1 FROM migrations WHERE name = ?', [file]);
                already = rows.length > 0;
            } else {
                already = await new Promise((resolve, reject) => {
                    this.connection.get('SELECT 1 FROM migrations WHERE name = ?', [file], (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    });
                });
            }
            if (!already) {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                if (isMySQL) {
                    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) {
                        await this.connection.execute(statement);
                    }
                    await this.connection.execute('INSERT INTO migrations (name) VALUES (?)', [file]);
                } else {
                    await new Promise((resolve, reject) => {
                        this.connection.exec(sql, err => err ? reject(err) : resolve());
                    });
                    await new Promise((resolve, reject) => {
                        this.connection.run('INSERT INTO migrations (name) VALUES (?)', [file], err => err ? reject(err) : resolve());
                    });
                }
                console.log(`Migration ${file} aplicada.`);
            }
        }
        console.log('Todas as migrations estão atualizadas.');
    }
};

module.exports = Database; 