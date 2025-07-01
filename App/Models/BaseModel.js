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
        this.resetBuilder();
    }

    // --- Query Builder ---
    resetBuilder() {
        this._select = '*';
        this._where = [];
        this._orderBy = '';
        this._limit = null;
        this._offset = null;
        this._params = [];
    }

    static get instance() {
        if (!this._instance) this._instance = new this();
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
        const sql = `DELETE FROM ${this.tableName()} WHERE ${this.instance.primaryKey} = ?`;
        await this.instance.db.delete(sql, [id]);
        this.instance.event.emit(`${this.tableName()}:deleted`, id);
        return true;
    }

    static async rawQuery(sql, params = []) {
        return await this.instance.db.query(sql, params);
    }

    // --- SQL Builder ---
    static buildSelect() {
        let sql = `SELECT ${this.instance._select} FROM ${this.tableName()}`;
        if (this.instance._where.length > 0) {
            const whereClauses = this.instance._where.map(w => `${w.key} ${w.op} ?`).join(' AND ');
            sql += ` WHERE ${whereClauses}`;
            this.instance._params = this.instance._where.map(w => w.value);
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