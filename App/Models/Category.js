const BaseModel = require('./BaseModel');

class Category extends BaseModel {
    constructor() {
        super();
        this.table = 'category';
        this.primaryKey = 'id';
        this.softDelete = false; 
        this.allowedFields = [
            'code', 'name', 'multiplo', 'fluxo', 'external_id', 'type'
        ];
    }
}

module.exports = Category; 