const BaseModel = require('./BaseModel');

class CategoryGroupItems extends BaseModel {
    constructor() {
        super();
        this.table = 'category_group_items';
        this.primaryKey = null; // Não possui chave primária simples
        this.allowedFields = ['category_group_id', 'category_id'];
    }

    static async deleteByGroupAndCategory(category_group_id, category_id) {
        const sql = `DELETE FROM category_group_items WHERE category_group_id = ? AND category_id = ?`;
        return await this.instance.db.delete(sql, [category_group_id, category_id]);
    }
}

module.exports = CategoryGroupItems; 