const BaseModel = require('./BaseModel');

class TicketSource extends BaseModel {
    constructor() {
        super();
        this.table = 'ticket_source';
        this.primaryKey = 'id';
        this.allowedFields = ['name', 'module', 'description'];
    }
}

module.exports = TicketSource; 