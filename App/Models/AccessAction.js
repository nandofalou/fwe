const BaseModel = require('./BaseModel');

class AccessAction extends BaseModel {
    constructor() {
        super();
        this.table = 'access_action';
        this.primaryKey = 'id';
        this.allowedFields = ['name', 'description'];
    }
}

module.exports = AccessAction; 