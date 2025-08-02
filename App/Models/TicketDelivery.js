const BaseModel = require('./BaseModel');

class TicketDelivery extends BaseModel {
    constructor() {
        super();
        this.table = 'ticket_delivery';
        this.primaryKey = 'id';
        this.allowedFields = [
            'ticket_id', 'event_id', 'terminal_id', 'access_action_id',
            'code', 'access_date', 'spin'
        ];
    }
}

module.exports = TicketDelivery; 