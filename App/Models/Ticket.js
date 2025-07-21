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
                ticket.master
            `)
            .join('event', 'event.id = ticket.event_id')
            .join('category', 'category.id = ticket.category_id');
    }

    static validateTicketQuery(dateNow) {
        return this
            .select(`
                ticket.code,
                ticket.id,
                ticket.fullname,
                category.name as categoryName,
                ticket.event_id,
                ticket.active,
                ticket.master,
                ticket.accredited_at,
                terminal.id as terminalId,
                category.multiplo,
                category.type,
                event.name as eventName,
                count(ticket_access.id) as access,
                max(ticket_access.access_date) as access_time,
                case when '${dateNow}' BETWEEN event.startdate and event.enddate
                    then 1
                    else 0
                end as eventActive
            `)
            .join('event', 'event.id = ticket.event_id', 'left')
            .join('ticket_access', 'ticket_access.ticket_id = ticket.id and ticket_access.access_action_id = 1', 'left')
            .join('category', 'category.id = ticket.category_id', 'left')
            .join('category_group_items', 'category_group_items.category_id = category.id', 'left')
            .join('category_group', 'category_group.id = category_group_items.category_group_id', 'left')
            .join('terminal', 'terminal.category_group_id = category_group.id', 'left')
            .groupBy('ticket.code');
          
    }

}

module.exports = Ticket; 