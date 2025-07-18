const Validator = require('../Helpers/Validator');

class CategoryGroupValidator extends Validator {
    static validateCreate(data) {
        const rules = {
            name: 'required|string|max:200',
            description: 'string|optional|max:500',
            created_at: 'string|optional',
            updated_at: 'string|optional'
        };
        return this.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            name: 'string|optional|max:200',
            description: 'string|optional|max:500',
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

module.exports = CategoryGroupValidator; 