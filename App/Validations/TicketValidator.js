const Validator = require('../Helpers/Validator');

class TicketValidator extends Validator {
    static validateCreate(data) {
        const rules = {
            event_id: 'required|numeric',
            category_id: 'required|numeric',
            code: 'required|string',
            fullname: 'string|optional',
            email: 'string|optional',
            documentId: 'string|optional',
            extrafield1: 'string|optional',
            extrafield2: 'string|optional',
            active: 'numeric|optional|in:0,1',
            master: 'numeric|optional|in:0,1'
        };
        return this.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            event_id: 'numeric|optional',
            category_id: 'numeric|optional',
            code: 'string|optional',
            fullname: 'string|optional',
            email: 'string|optional',
            documentId: 'string|optional',
            extrafield1: 'string|optional',
            extrafield2: 'string|optional',
            active: 'numeric|optional|in:0,1',
            master: 'numeric|optional|in:0,1'
        };
        return this.validate(data, rules);
    }

    static validateId(id) {
        const rules = {
            id: 'required|numeric'
        };
        return this.validate({ id }, rules);
    }
}

module.exports = TicketValidator; 