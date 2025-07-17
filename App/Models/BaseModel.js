const Database = require('../Helpers/Database');
const Validation = require('../Helpers/Validation');
const Event = require('../Helpers/Event');

class BaseModel {
    constructor(table) {
        this.table = table;
        this.db = Database;
        this.validation = Validation;
        this.event = Event;
        this.primaryKey = 'id';
        this.allowedFields = [];
        this.softDelete = false; // padrão: hard delete
    }

    // --- Query Builder ---
    resetBuilder() {
        this._select = '*';
        this._where = [];
        this._orderBy = '';
        this._limit = null;
        this._offset = null;
        this._params = [];
        this._joins = [];
        this._groupBy = '';
        this._having = [];
    }

    static get instance() {
        if (!this._instance) {
            this._instance = new this();
            this._instance.resetBuilder();
        }
        return this._instance;
    }

    static tableName() {
        return this.instance.table;
    }

    // --- Encadeamento ---
    static select(fields) {
        this.instance._select = Array.isArray(fields) ? fields.join(',') : fields;
        return this;
    }

    static where(conditions) {
        if (typeof conditions === 'object') {
            Object.entries(conditions).forEach(([key, value]) => {
                this.instance._where.push({ key, op: '=', value });
            });
        } else {
            // Exemplo: where('id', 1)
            this.instance._where.push({ key: arguments[0], op: '=', value: arguments[1] });
        }
        return this;
    }

    static orderBy(field, direction = 'ASC') {
        this.instance._orderBy = `ORDER BY ${field} ${direction}`;
        return this;
    }

    static limit(limit, offset = null) {
        this.instance._limit = limit;
        this.instance._offset = offset;
        return this;
    }

    // --- JOIN Methods ---
    
    /**
     * INNER JOIN
     * @param {string} table - Tabela para fazer join
     * @param {string} condition - Condição do join (ex: 'users.id = posts.user_id')
     * @returns {BaseModel} - Para encadeamento
     */
    static join(table, condition) {
        this.instance._joins.push({
            type: 'INNER',
            table: table,
            condition: condition
        });
        return this;
    }

    /**
     * LEFT JOIN
     * @param {string} table - Tabela para fazer join
     * @param {string} condition - Condição do join (ex: 'users.id = posts.user_id')
     * @returns {BaseModel} - Para encadeamento
     */
    static leftJoin(table, condition) {
        this.instance._joins.push({
            type: 'LEFT',
            table: table,
            condition: condition
        });
        return this;
    }

    /**
     * RIGHT JOIN
     * @param {string} table - Tabela para fazer join
     * @param {string} condition - Condição do join (ex: 'users.id = posts.user_id')
     * @returns {BaseModel} - Para encadeamento
     */
    static rightJoin(table, condition) {
        this.instance._joins.push({
            type: 'RIGHT',
            table: table,
            condition: condition
        });
        return this;
    }

    /**
     * FULL OUTER JOIN
     * @param {string} table - Tabela para fazer join
     * @param {string} condition - Condição do join (ex: 'users.id = posts.user_id')
     * @returns {BaseModel} - Para encadeamento
     */
    static fullJoin(table, condition) {
        this.instance._joins.push({
            type: 'FULL OUTER',
            table: table,
            condition: condition
        });
        return this;
    }

    /**
     * CROSS JOIN
     * @param {string} table - Tabela para fazer join
     * @returns {BaseModel} - Para encadeamento
     */
    static crossJoin(table) {
        this.instance._joins.push({
            type: 'CROSS',
            table: table,
            condition: null
        });
        return this;
    }

    /**
     * GROUP BY
     * @param {string|array} fields - Campos para agrupar
     * @returns {BaseModel} - Para encadeamento
     */
    static groupBy(fields) {
        if (Array.isArray(fields)) {
            this.instance._groupBy = fields.join(', ');
        } else {
            this.instance._groupBy = fields;
        }
        return this;
    }

    /**
     * HAVING
     * @param {string} condition - Condição HAVING
     * @param {array} params - Parâmetros para a condição (opcional)
     * @returns {BaseModel} - Para encadeamento
     */
    static having(condition, params = []) {
        this.instance._having.push({
            condition: condition,
            params: params
        });
        return this;
    }

    static like(field, value, position = 'both') {
        // Se for objeto, adiciona múltiplos likes
        if (typeof field === 'object' && field !== null) {
            Object.entries(field).forEach(([k, v]) => {
                this.like(k, v, position);
            });
            return this;
        }
        // Monta o valor com wildcards
        let likeValue = value;
        if (position === 'before') {
            likeValue = `%${value}`;
        } else if (position === 'after') {
            likeValue = `${value}%`;
        } else { // both (padrão)
            likeValue = `%${value}%`;
        }
        this.instance._where.push({ key: field, op: 'LIKE', value: likeValue });
        return this;
    }

    static whereIn(field, values) {
        this.instance._where.push({ key: field, op: 'IN', value: values });
        return this;
    }

    static notIn(field, values) {
        this.instance._where.push({ key: field, op: 'NOT IN', value: values });
        return this;
    }

    static not(field, value) {
        this.instance._where.push({ key: field, op: '!=', value });
        return this;
    }

    static isNull(field) {
        this.instance._where.push({ key: field, op: 'IS NULL' });
        return this;
    }

    static isNotNull(field) {
        this.instance._where.push({ key: field, op: 'IS NOT NULL' });
        return this;
    }

    // --- Execução ---
    static async find(id) {
        this.instance.resetBuilder();
        this.where({ [this.instance.primaryKey]: id });
        return await this.first();
    }

    static async findAll(limit = null, offset = null) {
        if (limit) this.limit(limit, offset);
        return await this.get();
    }

    static async first() {
        this.limit(1);
        const rows = await this.get();
        return rows[0] || null;
    }

    static async get() {
        // Se softDelete, filtra deleted_at IS NULL
        if (this.instance.softDelete) {
            this.where({ deleted_at: null });
        }
        const sql = this.buildSelect();
        const params = this.instance._params;
        const rows = await this.instance.db.query(sql, params);
        this.instance.resetBuilder();
        return rows;
    }

    static async count() {
        this.instance._select = `COUNT(${this.instance.primaryKey}) as count`;
        const rows = await this.get();
        return Number(rows[0]?.count || 0);
    }

    static async countQuery(idxcount = null, perPage = 10) {
        let selectCount = ""
        if(idxcount != null) {
            selectCount = `COUNT(DISTINCT ${idxcount}) as count`;
        } else {
            selectCount = `COUNT(${this.instance.primaryKey}) as count`;
        }
        

        const sql = this.buildCount(selectCount)
        const params = this.instance._params;
        const rows = await this.instance.db.query(sql, params);

        const totalRows = rows[0]?.count || 0;

        const pages = Math.floor((parseInt(totalRows) || 0) / perPage) + 1;
   
        return {
            pages, rows: totalRows, perPage
        };
    }

    static async insert(data) {
        const fields = Object.keys(data).filter(f => this.instance.allowedFields.length === 0 || this.instance.allowedFields.includes(f));
        const values = fields.map(f => data[f]);
        const placeholders = fields.map(() => '?').join(',');
        const sql = `INSERT INTO ${this.tableName()} (${fields.join(',')}) VALUES (${placeholders})`;
        const result = await this.instance.db.insert(sql, values);
        this.instance.event.emit(`${this.tableName()}:created`, result);
        return result;
    }

    static async update(id, data) {
        const fields = Object.keys(data).filter(f => this.instance.allowedFields.length === 0 || this.instance.allowedFields.includes(f));
        const values = fields.map(f => data[f]);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName()} SET ${setClause} WHERE ${this.instance.primaryKey} = ?`;
        await this.instance.db.update(sql, [...values, id]);
        this.instance.event.emit(`${this.tableName()}:updated`, { id, ...data });
        return true;
    }

    static async delete(id) {
        if (this.instance.softDelete) {
            // Soft delete: marca deleted_at
            const sql = `UPDATE ${this.tableName()} SET deleted_at = ? WHERE ${this.instance.primaryKey} = ?`;
            await this.instance.db.update(sql, [new Date(), id]);
        } else {
            // Hard delete: remove do banco
            const sql = `DELETE FROM ${this.tableName()} WHERE ${this.instance.primaryKey} = ?`;
            await this.instance.db.delete(sql, [id]);
        }
        this.instance.event.emit(`${this.tableName()}:deleted`, id);
        return true;
    }

    static async rawQuery(sql, params = []) {
        return await this.instance.db.query(sql, params);
    }

    // --- SQL Builder ---
    static buildSelect() {
        let sql = `SELECT ${this.instance._select} FROM ${this.tableName()}`;
        
        // Adiciona JOINs
        if (this.instance._joins.length > 0) {
            this.instance._joins.forEach(join => {
                if (join.type === 'CROSS') {
                    sql += ` CROSS JOIN ${join.table}`;
                } else {
                    sql += ` ${join.type} JOIN ${join.table} ON ${join.condition}`;
                }
            });
        }
        
        if (this.instance._where.length > 0) {
            const whereClauses = this.instance._where.map(w => {
                if (w.op === 'IN' || w.op === 'NOT IN') {
                    const placeholders = w.value.map(() => '?').join(', ');
                    return `${w.key} ${w.op} (${placeholders})`;
                } else if (w.op === 'LIKE') {
                    return `${w.key} LIKE ?`;
                } else if (w.op === 'IS NULL' || w.op === 'IS NOT NULL') {
                    return `${w.key} ${w.op}`;
                } else {
                    return `${w.key} ${w.op} ?`;
                }
            }).join(' AND ');
            sql += ` WHERE ${whereClauses}`;
            // Monta os parâmetros na ordem correta
            this.instance._params = [];
            this.instance._where.forEach(w => {
                if (w.op === 'IN' || w.op === 'NOT IN') {
                    this.instance._params.push(...w.value);
                } else if (w.op === 'IS NULL' || w.op === 'IS NOT NULL') {
                    // Não adiciona parâmetro
                } else {
                    this.instance._params.push(w.value);
                }
            });
        }
        
        // Adiciona GROUP BY
        if (this.instance._groupBy) {
            sql += ` GROUP BY ${this.instance._groupBy}`;
        }
        
        // Adiciona HAVING
        if (this.instance._having.length > 0) {
            const havingClauses = this.instance._having.map(h => h.condition).join(' AND ');
            sql += ` HAVING ${havingClauses}`;
            // Adiciona parâmetros do HAVING
            this.instance._having.forEach(h => {
                this.instance._params.push(...h.params);
            });
        }
        
        if (this.instance._orderBy) sql += ` ${this.instance._orderBy}`;
        if (this.instance._limit) {
            sql += ` LIMIT ${this.instance._limit}`;
            if (this.instance._offset) sql += ` OFFSET ${this.instance._offset}`;
        }
        return sql;
    }

    static buildCount(selectCount) {
        let sql = `SELECT ${selectCount} FROM ${this.tableName()}`;
        
        // Adiciona JOINs
        if (this.instance._joins.length > 0) {
            this.instance._joins.forEach(join => {
                if (join.type === 'CROSS') {
                    sql += ` CROSS JOIN ${join.table}`;
                } else {
                    sql += ` ${join.type} JOIN ${join.table} ON ${join.condition}`;
                }
            });
        }
        
        if (this.instance._where.length > 0) {
            const whereClauses = this.instance._where.map(w => `${w.key} ${w.op} ?`).join(' AND ');
            sql += ` WHERE ${whereClauses}`;
            this.instance._params = this.instance._where.map(w => w.value);
        }
        
        // Adiciona GROUP BY
        if (this.instance._groupBy) {
            sql += ` GROUP BY ${this.instance._groupBy}`;
        }
        
        // Adiciona HAVING
        if (this.instance._having.length > 0) {
            const havingClauses = this.instance._having.map(h => h.condition).join(' AND ');
            sql += ` HAVING ${havingClauses}`;
            // Adiciona parâmetros do HAVING
            this.instance._having.forEach(h => {
                this.instance._params.push(...h.params);
            });
        }
        
        if (this.instance._orderBy) sql += ` ${this.instance._orderBy}`;
        if (this.instance._limit) {
            sql += ` LIMIT ${this.instance._limit}`;
            if (this.instance._offset) sql += ` OFFSET ${this.instance._offset}`;
        }
        return sql;
    }

    async find(id) {
        const result = await this.db.query(
            `SELECT * FROM ${this.table} WHERE id = ?`,
            [id]
        );
        return result[0];
    }

    async findAll(conditions = {}, orderBy = 'id DESC', limit = null, offset = null) {
        let sql = `SELECT * FROM ${this.table}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions)
                .map(key => `${key} = ?`)
                .join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params.push(...Object.values(conditions));
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

        return await this.db.query(sql, params);
    }

    async create(data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const result = await this.db.insert(
            `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`,
            values
        );

        this.event.emit(`${this.table}:created`, result);
        return result;
    }

    async update(id, data) {
        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(data), id];

        const result = await this.db.update(
            `UPDATE ${this.table} SET ${setClause} WHERE id = ?`,
            values
        );

        this.event.emit(`${this.table}:updated`, { id, ...data });
        return result;
    }

    async delete(id) {
        const result = await this.db.delete(
            `DELETE FROM ${this.table} WHERE id = ?`,
            [id]
        );

        this.event.emit(`${this.table}:deleted`, id);
        return result;
    }
}

module.exports = BaseModel; 