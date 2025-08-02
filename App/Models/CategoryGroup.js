const BaseModel = require('./BaseModel');

class CategoryGroup extends BaseModel {
    constructor() {
        super();
        this.table = 'category_group';
        this.primaryKey = 'id';
        this.allowedFields = ['name'];
    }
}

module.exports = CategoryGroup; 