const Database = require('../Helpers/Database');
const Validation = require('../Helpers/Validation');
const Event = require('../Helpers/Event');

class BaseModel {
    constructor(table) {
        this.table = table;
        this.db = Database;
        this.validation = Validation;
        this.event = Event;
        this.connection = 'default';
    }

    async find(id) {
        const result = await this.db.query(
            this.connection,
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

        return await this.db.query(this.connection, sql, params);
    }

    async create(data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const result = await this.db.insert(
            this.connection,
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
            this.connection,
            `UPDATE ${this.table} SET ${setClause} WHERE id = ?`,
            values
        );

        this.event.emit(`${this.table}:updated`, { id, ...data });
        return result;
    }

    async delete(id) {
        const result = await this.db.delete(
            this.connection,
            `DELETE FROM ${this.table} WHERE id = ?`,
            [id]
        );

        this.event.emit(`${this.table}:deleted`, id);
        return result;
    }
}

module.exports = BaseModel; 