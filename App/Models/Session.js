const BaseModel = require('./BaseModel');

class Session extends BaseModel {
    constructor() {
        super('fwe_session');
        this.primaryKey = 'id';
        this.allowedFields = ['id', 'ip_address', 'user_agent', 'user_id', 'data', 'created_at', 'updated_at', 'expires_at'];
    }
}

module.exports = Session; 