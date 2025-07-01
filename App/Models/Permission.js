const BaseModel = require('./BaseModel');

class Permission extends BaseModel {
    constructor() {
        super();
        this.table = 'permission';
        this.primaryKey = 'id';
        this.softDelete = false; 
        this.allowedFields = ['name', 'description'];
    }
}

module.exports = Permission; 