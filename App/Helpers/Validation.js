const Event = require('./Event');

/**
 * Classe para manipulação de validação
 */
class Validation {
    constructor() {
        this.event = Event;
        this.rules = new Map();
        this.registerDefaultRules();
    }

    /**
     * Registra uma regra de validação
     * @param {string} name Nome da regra
     * @param {Function} rule Função de validação
     */
    registerRule(name, rule) {
        this.rules.set(name, rule);
        this.event.emit('validation:rule:registered', name);
    }

    /**
     * Remove uma regra de validação
     * @param {string} name Nome da regra
     */
    removeRule(name) {
        this.rules.delete(name);
        this.event.emit('validation:rule:removed', name);
    }

    /**
     * Verifica se uma regra existe
     * @param {string} name Nome da regra
     * @returns {boolean} true se existir
     */
    hasRule(name) {
        return this.rules.has(name);
    }

    /**
     * Obtém uma regra de validação
     * @param {string} name Nome da regra
     * @returns {Function|null} Regra
     */
    getRule(name) {
        return this.rules.get(name) || null;
    }

    /**
     * Obtém todas as regras de validação
     * @returns {Map} Regras
     */
    getRules() {
        return this.rules;
    }

    /**
     * Valida dados
     * @param {Object} data Dados
     * @param {Object} rules Regras
     * @returns {Object} Resultado
     */
    validate(data, rules) {
        const errors = new Map();

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const fieldErrors = [];

            for (const rule of fieldRules) {
                const [ruleName, ...params] = rule.split(':');
                const ruleFn = this.rules.get(ruleName);

                if (ruleFn && !ruleFn(value, ...params)) {
                    fieldErrors.push(this.getErrorMessage(ruleName, field, params));
                }
            }

            if (fieldErrors.length > 0) {
                errors.set(field, fieldErrors);
            }
        }

        const isValid = errors.size === 0;
        this.event.emit('validation:validated', data, rules, errors, isValid);

        return {
            isValid,
            errors
        };
    }

    /**
     * Obtém a mensagem de erro
     * @param {string} rule Nome da regra
     * @param {string} field Campo
     * @param {Array} params Parâmetros
     * @returns {string} Mensagem
     */
    getErrorMessage(rule, field, params) {
        const messages = {
            required: `${field} é obrigatório`,
            email: `${field} deve ser um email válido`,
            min: `${field} deve ter no mínimo ${params[0]} caracteres`,
            max: `${field} deve ter no máximo ${params[0]} caracteres`,
            numeric: `${field} deve ser um número`,
            integer: `${field} deve ser um número inteiro`,
            decimal: `${field} deve ser um número decimal`,
            alpha: `${field} deve conter apenas letras`,
            alpha_num: `${field} deve conter apenas letras e números`,
            alpha_dash: `${field} deve conter apenas letras, números, traços e underscores`,
            date: `${field} deve ser uma data válida`,
            date_format: `${field} deve estar no formato ${params[0]}`,
            in: `${field} deve ser um dos valores: ${params.join(', ')}`,
            not_in: `${field} não deve ser um dos valores: ${params.join(', ')}`,
            between: `${field} deve estar entre ${params[0]} e ${params[1]}`,
            size: `${field} deve ter ${params[0]} caracteres`,
            url: `${field} deve ser uma URL válida`,
            ip: `${field} deve ser um endereço IP válido`,
            json: `${field} deve ser um JSON válido`,
            regex: `${field} deve corresponder ao padrão ${params[0]}`
        };

        return messages[rule] || `${field} é inválido`;
    }

    /**
     * Registra as regras padrão
     */
    registerDefaultRules() {
        this.registerRule('required', value => value !== undefined && value !== null && value !== '');
        this.registerRule('email', value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        this.registerRule('min', (value, min) => value.length >= min);
        this.registerRule('max', (value, max) => value.length <= max);
        this.registerRule('numeric', value => !isNaN(value));
        this.registerRule('integer', value => Number.isInteger(Number(value)));
        this.registerRule('decimal', value => !isNaN(value) && value.toString().includes('.'));
        this.registerRule('alpha', value => /^[a-zA-Z]+$/.test(value));
        this.registerRule('alpha_num', value => /^[a-zA-Z0-9]+$/.test(value));
        this.registerRule('alpha_dash', value => /^[a-zA-Z0-9_-]+$/.test(value));
        this.registerRule('date', value => !isNaN(Date.parse(value)));
        this.registerRule('date_format', (value, format) => {
            // Implementação básica, pode ser expandida para suportar mais formatos
            return true;
        });
        this.registerRule('in', (value, ...values) => values.includes(value));
        this.registerRule('not_in', (value, ...values) => !values.includes(value));
        this.registerRule('between', (value, min, max) => value >= min && value <= max);
        this.registerRule('size', (value, size) => value.length === size);
        this.registerRule('url', value => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });
        this.registerRule('ip', value => {
            const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
            const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            return ipv4Regex.test(value) || ipv6Regex.test(value);
        });
        this.registerRule('json', value => {
            try {
                JSON.parse(value);
                return true;
            } catch {
                return false;
            }
        });
        this.registerRule('regex', (value, pattern) => new RegExp(pattern).test(value));
    }
}

module.exports = new Validation(); 