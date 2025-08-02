const Validator = require('../Helpers/Validator');

class AccesstValidator {
    static validateLogin(data) {
        const rules = {
            pin: 'required'
        };
        return Validator.validate(data, rules);
    }

    static validateRegister(data) {
        const rules = {
            pin: 'required',
            ticket: 'required|string',
            viewImage: 'optional|numeric'
        };
        return Validator.validate(data, rules);
    }
}

module.exports = AccesstValidator; 