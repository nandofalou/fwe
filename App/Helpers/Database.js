const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const Config = require('./Config');
const Event = require('./Event');

/**
 * Classe para manipulação de banco de dados
 */
class Database {
    constructor() {
        this.config = Config;
        this.connection = null;
        this.type = this.config.get('database.type', 'sqlite');
        this.connections = new Map();
        this.event = Event;
    }

    /**
     * Conecta a um banco de dados
     * @param {string} name Nome da conexão
     * @param {string} file Caminho do arquivo
     * @returns {Promise<void>}
     */
    connect(name, file) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(file, (err) => {
                if (err) {
                    this.event.emit('database:error', err);
                    reject(err);
                    return;
                }

                this.connections.set(name, db);
                this.event.emit('database:connected', name, file);
                resolve();
            });
        });
    }

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
    }

    /**
     * Executa uma consulta SQL
     * @param {string} name Nome da conexão
     * @param {string} sql Consulta SQL
     * @param {Array} params Parâmetros (opcional)
     * @returns {Promise<Array>} Resultados
     */
    query(name, sql, params = []) {
        return new Promise((resolve, reject) => {
            const db = this.connections.get(name);

            if (!db) {
                const err = new Error(`Conexão "${name}" não encontrada`);
                this.event.emit('database:error', err);
                reject(err);
                return;
            }

            db.all(sql, params, (err, rows) => {
                if (err) {
                    this.event.emit('database:error', err);
                    reject(err);
                    return;
                }

                this.event.emit('database:query', name, sql, params, rows);
                resolve(rows);
            });
        });
    }

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
    }

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
    }

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
    }

    /**
     * Inicia uma transação
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    beginTransaction(name) {
        return this.query(name, 'BEGIN TRANSACTION');
    }

    /**
     * Confirma uma transação
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    commit(name) {
        return this.query(name, 'COMMIT');
    }

    /**
     * Desfaz uma transação
     * @param {string} name Nome da conexão
     * @returns {Promise<void>}
     */
    rollback(name) {
        return this.query(name, 'ROLLBACK');
    }

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
    }

    /**
     * Verifica se uma conexão existe
     * @param {string} name Nome da conexão
     * @returns {boolean} true se existir
     */
    hasConnection(name) {
        return this.connections.has(name);
    }

    /**
     * Obtém uma conexão
     * @param {string} name Nome da conexão
     * @returns {sqlite3.Database|null} Conexão
     */
    getConnection(name) {
        return this.connections.get(name) || null;
    }

    /**
     * Obtém todas as conexões
     * @returns {Map} Conexões
     */
    getConnections() {
        return this.connections;
    }

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
    }

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
    }

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
    }

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
    }

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
    }

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
    }

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
}

module.exports = new Database(); 