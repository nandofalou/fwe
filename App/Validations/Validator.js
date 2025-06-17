class Validator {
    constructor(data, rules) {
        this.data = data;
        this.rules = rules;
        this.errors = {};
    }

    /**
     * Valida os dados
     * @returns {boolean} true se válido, false se inválido
     */
    validate() {
        for (const field in this.rules) {
            const rules = this.rules[field].split('|');
            for (const rule of rules) {
                const [ruleName, ...params] = rule.split(':');
                const method = `validate${ruleName.charAt(0).toUpperCase() + ruleName.slice(1)}`;
                
                if (typeof this[method] === 'function') {
                    const isValid = this[method](field, ...params);
                    if (!isValid) break;
                }
            }
        }

        return Object.keys(this.errors).length === 0;
    }

    /**
     * Adiciona um erro
     * @param {string} field Campo com erro
     * @param {string} message Mensagem de erro
     */
    addError(field, message) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push(message);
    }

    /**
     * Valida se o campo é obrigatório
     * @param {string} field Campo a ser validado
     * @returns {boolean} true se válido
     */
    validateRequired(field) {
        const value = this.data[field];
        if (value === undefined || value === null || value === '') {
            this.addError(field, 'O campo é obrigatório');
            return false;
        }
        return true;
    }

    /**
     * Valida se o campo é um email válido
     * @param {string} field Campo a ser validado
     * @returns {boolean} true se válido
     */
    validateEmail(field) {
        const value = this.data[field];
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            this.addError(field, 'Email inválido');
            return false;
        }
        return true;
    }

    /**
     * Valida o tamanho mínimo do campo
     * @param {string} field Campo a ser validado
     * @param {string} min Tamanho mínimo
     * @returns {boolean} true se válido
     */
    validateMin(field, min) {
        const value = this.data[field];
        if (value && value.length < parseInt(min)) {
            this.addError(field, `O campo deve ter no mínimo ${min} caracteres`);
            return false;
        }
        return true;
    }

    /**
     * Valida o tamanho máximo do campo
     * @param {string} field Campo a ser validado
     * @param {string} max Tamanho máximo
     * @returns {boolean} true se válido
     */
    validateMax(field, max) {
        const value = this.data[field];
        if (value && value.length > parseInt(max)) {
            this.addError(field, `O campo deve ter no máximo ${max} caracteres`);
            return false;
        }
        return true;
    }

    /**
     * Valida se o campo é numérico
     * @param {string} field Campo a ser validado
     * @returns {boolean} true se válido
     */
    validateNumeric(field) {
        const value = this.data[field];
        if (value && isNaN(value)) {
            this.addError(field, 'O campo deve ser numérico');
            return false;
        }
        return true;
    }

    /**
     * Valida se o campo é único na tabela
     * @param {string} field Campo a ser validado
     * @param {string} table Tabela a ser verificada
     * @param {string} column Coluna a ser verificada
     * @param {string} except ID a ser ignorado
     * @returns {boolean} true se válido
     */
    validateUnique(field, table, column, except = null) {
        const value = this.data[field];
        if (!value) return true;

        // TODO: Implementar verificação no banco de dados
        return true;
    }

    /**
     * Retorna os erros encontrados
     * @returns {Object} Erros encontrados
     */
    getErrors() {
        return this.errors;
    }
}

/**
 * Valida os dados com as regras especificadas
 * @param {Object} data Dados a serem validados
 * @param {Object} rules Regras de validação
 * @returns {Object} Resultado da validação
 */
function validate(data, rules) {
    const validator = new Validator(data, rules);
    const isValid = validator.validate();
    return {
        isValid,
        errors: validator.getErrors()
    };
}

module.exports = { validate }; 