const BaseModel = require('./BaseModel');

class Terminal extends BaseModel {
    constructor() {
        super();
        this.table = 'terminal';
        this.primaryKey = 'id';
        this.allowedFields = [
            'pin', 'ip', 'model', 'name', 'plataform', 'category_group_id',
            'active', 'created_at', 'updated_at', 'deleted_at'
        ];
    }
}

module.exports = Terminal; 