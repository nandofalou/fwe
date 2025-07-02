const Validator = require('../Helpers/Validator');

class EventValidator {
    static validateCreate(data) {
        const rules = {
            name: 'required',
            startdate: 'required|date',
            enddate: 'required|date',
            active: 'required|numeric'
        };
        return Validator.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            name: 'required',
            startdate: 'required|date',
            enddate: 'required|date',
            active: 'required|numeric'
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

module.exports = EventValidator; 