const Validator = require('../Helpers/Validator');

class UserValidator {
    static validateCreate(data) {
        const rules = {
            name: 'required|max:200',
            email: 'required|email|max:200',
            pass: 'required|min:6',
            active: 'numeric|in:0,1',
            permission_id: 'required|numeric'
        };
        return Validator.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            name: 'required|max:200',
            email: 'required|email|max:200',
            pass: 'min:6|optional',
            active: 'numeric|in:0,1',
            permission_id: 'required|numeric'
        };
        return Validator.validate(data, rules);
    }

    static validateId(id) {
        const rules = {
            id: 'required|numeric',
        };
        return Validator.validate({ id }, rules);
    }
}

module.exports = UserValidator; 