const BaseModel = require('./BaseModel');

class Ticket extends BaseModel {
    constructor() {
        super();
        this.table = 'ticket';
        this.primaryKey = 'id';
        this.allowedFields = [
            'event_id', 'user_id', 'category_id', 'ticket_source_event_id',
            'code', 'fullname', 'email', 'documentId', 'extrafield1', 'extrafield2',
            'active', 'master', 'accredited_at', 'created_at', 'updated_at', 'deleted_at'
        ];
    }

    /**
     * Retorna o builder padrão para DataTable de tickets
     */
    static dataTableQuery() {
        return this
            .select(`
                ticket.id,
                ticket.code,
                event.name as eventName,
                category.name as categoryName,
                ticket.active,
                ticket.master,
                ticket.extrafield1,
                '' as image
            `)
            .join('event', 'event.id = ticket.event_id')
            .join('category', 'category.id = ticket.category_id');
    }
}

module.exports = Ticket; 