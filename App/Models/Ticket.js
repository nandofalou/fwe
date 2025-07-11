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
}

module.exports = Ticket; 