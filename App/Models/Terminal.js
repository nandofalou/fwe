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

        this.models = [
            'CATRACA', 'APP', 'OUTROS'
        ];
    }

    /**
     * Retorna o builder padrão para DataTable de tickets
     */
    static getTerminal() {
        return this
            .select([
                'terminal.id', 
                'terminal.pin', 
                'terminal.name', 
                'terminal.category_group_id', 
                'category_group.name as groupName'
            ])
            .join(
                'category_group', 
                'category_group.id = terminal.category_group_id',
                'INNER')
            .where('terminal.active', 1);
    }


}

module.exports = Terminal; 