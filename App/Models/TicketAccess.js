const BaseModel = require('./BaseModel');

class TicketAccess extends BaseModel {
    constructor() {
        super();
        this.table = 'ticket_access';
        this.primaryKey = 'id';
        this.allowedFields = [
            'ticket_id', 'event_id', 'terminal_id', 'code', 'access_date',
            'access_action_id', 'spin'
        ];
    }
}

module.exports = TicketAccess; 