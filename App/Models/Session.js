const BaseModel = require('./BaseModel');

class Session extends BaseModel {
    constructor() {
        super('fwe_session');
        this.primaryKey = 'id';
        this.allowedFields = ['id', 'ip_address', 'user_agent', 'user_id', 'data', 'created_at', 'updated_at', 'expires_at'];
    }

    /**
     * Exclui todas as sessões expiradas
     */
    static async deleteExpired() {
        const now = new Date();
        const sql = `DELETE FROM fwe_session WHERE expires_at < ?`;
        await this.instance.db.delete(sql, [now]);
    }
}

module.exports = Session; 