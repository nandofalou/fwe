const Validator = require('../Helpers/Validator');

class TerminalValidator extends Validator {
    static validateCreate(data) {
        const rules = {
            pin: 'string|optional|max:4',
            ip: 'string|optional|max:20',
            model: 'string|optional|max:50',
            name: 'required|string|max:50',
            plataform: 'string|optional|max:50',
            category_group_id: 'numeric|optional',
            active: 'numeric|optional|in:0,1',
            created_at: 'string|optional',
            updated_at: 'string|optional'
        };
        return this.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            pin: 'string|optional|max:4',
            ip: 'string|optional|max:20',
            model: 'string|optional|max:50',
            name: 'string|optional|max:50',
            plataform: 'string|optional|max:50',
            category_group_id: 'numeric|optional',
            active: 'numeric|optional|in:0,1',
            updated_at: 'string|optional'
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

module.exports = TerminalValidator; 