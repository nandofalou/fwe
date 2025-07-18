const Validator = require('../Helpers/Validator');

class CategoryValidator extends Validator {
    static validateCreate(data) {
        const rules = {
            name: 'required|string|max:200',
            code: 'numeric|optional',
            multiplo: 'optional',
            fluxo: 'optional',
            external_id: 'numeric|optional',
            type: 'string|optional|in:TICKET,CREDENCIADO,COLABORADOR'
        };
        return this.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            name: 'string|optional|max:200',
            code: 'numeric|optional',
            multiplo: 'optional',
            fluxo: 'optional',
            external_id: 'numeric|optional',
            type: 'string|optional|in:TICKET,CREDENCIADO,COLABORADOR'
        };
        return this.validate(data, rules);
    }

    static validateId(id) {
        const rules = {
            id: 'required|numeric'
        };
        return this.validate({ id }, rules);
    }

    static validateType(type) {
        const rules = {
            type: 'required|string|in:TICKET,CREDENCIADO,COLABORADOR'
        };
        return this.validate({ type }, rules);
    }

    static validateCode(code) {
        const rules = {
            code: 'required|numeric'
        };
        return this.validate({ code }, rules);
    }

    static validateName(name) {
        const rules = {
            name: 'required|string|min:1'
        };
        return this.validate({ name }, rules);
    }
}

module.exports = CategoryValidator; 