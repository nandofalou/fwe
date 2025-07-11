const BaseModel = require('./BaseModel');

class CategoryGroupItems extends BaseModel {
    constructor() {
        super();
        this.table = 'category_group_items';
        this.primaryKey = null; // Não possui chave primária simples
        this.allowedFields = ['category_group_id', 'category_id'];
    }
}

module.exports = CategoryGroupItems; 