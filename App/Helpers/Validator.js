/**
 * Classe para manipulação de validação de requisições
 */
class Validator {
    /**
     * Valida uma requisição
     * @param {Object} data Dados da requisição
     * @param {Object} rules Regras de validação
     * @returns {Object} Resultado da validação
     */
    static validate(data, rules) {
        const errors = {};
        const validated = {};

        for (const field in rules) {
            const fieldRules = rules[field].split('|');
            const value = data[field];

            for (const rule of fieldRules) {
                const [ruleName, ruleValue] = rule.split(':');

                switch (ruleName) {
                    case 'required':
                        if (!value) {
                            errors[field] = 'Campo obrigatório';
                        }
                        break;

                    case 'email':
                        if (value && !this.isValidEmail(value)) {
                            errors[field] = 'Email inválido';
                        }
                        break;

                    case 'min':
                        if (value && value.length < ruleValue) {
                            errors[field] = `Mínimo de ${ruleValue} caracteres`;
                        }
                        break;

                    case 'max':
                        if (value && value.length > ruleValue) {
                            errors[field] = `Máximo de ${ruleValue} caracteres`;
                        }
                        break;

                    case 'numeric':
                        if (value && !this.isNumeric(value)) {
                            errors[field] = 'Deve ser um número';
                        }
                        break;

                    case 'integer':
                        if (value && !this.isInteger(value)) {
                            errors[field] = 'Deve ser um número inteiro';
                        }
                        break;

                    case 'decimal':
                        if (value && !this.isDecimal(value, ruleValue)) {
                            errors[field] = `Deve ser um número decimal com ${ruleValue} casas`;
                        }
                        break;

                    case 'alpha':
                        if (value && !this.isAlpha(value)) {
                            errors[field] = 'Deve conter apenas letras';
                        }
                        break;

                    case 'alpha_num':
                        if (value && !this.isAlphaNum(value)) {
                            errors[field] = 'Deve conter apenas letras e números';
                        }
                        break;

                    case 'alpha_dash':
                        if (value && !this.isAlphaDash(value)) {
                            errors[field] = 'Deve conter apenas letras, números, traços e underscores';
                        }
                        break;

                    case 'date':
                        if (value && !this.isDate(value)) {
                            errors[field] = 'Data inválida';
                        }
                        break;

                    case 'date_format':
                        if (value && !this.isDateFormat(value, ruleValue)) {
                            errors[field] = `Data deve estar no formato ${ruleValue}`;
                        }
                        break;

                    case 'in':
                        const values = ruleValue.split(',');
                        if (value && !values.includes(value)) {
                            errors[field] = `Valor deve ser um dos seguintes: ${values.join(', ')}`;
                        }
                        break;

                    case 'not_in':
                        const notValues = ruleValue.split(',');
                        if (value && notValues.includes(value)) {
                            errors[field] = `Valor não pode ser um dos seguintes: ${notValues.join(', ')}`;
                        }
                        break;

                    case 'between':
                        const [min, max] = ruleValue.split(',');
                        if (value && (value < min || value > max)) {
                            errors[field] = `Valor deve estar entre ${min} e ${max}`;
                        }
                        break;

                    case 'size':
                        if (value && value.length !== parseInt(ruleValue)) {
                            errors[field] = `Deve ter exatamente ${ruleValue} caracteres`;
                        }
                        break;

                    case 'url':
                        if (value && !this.isUrl(value)) {
                            errors[field] = 'URL inválida';
                        }
                        break;

                    case 'ip':
                        if (value && !this.isIp(value)) {
                            errors[field] = 'IP inválido';
                        }
                        break;

                    case 'json':
                        if (value && !this.isJson(value)) {
                            errors[field] = 'JSON inválido';
                        }
                        break;

                    case 'regex':
                        if (value && !new RegExp(ruleValue).test(value)) {
                            errors[field] = 'Formato inválido';
                        }
                        break;
                }
            }

            if (!errors[field]) {
                validated[field] = value;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            validated
        };
    }

    /**
     * Verifica se é um email válido
     * @param {string} email Email a ser verificado
     * @returns {boolean} true se válido
     */
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Verifica se é um número
     * @param {string|number} value Valor a ser verificado
     * @returns {boolean} true se for número
     */
    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Verifica se é um número inteiro
     * @param {string|number} value Valor a ser verificado
     * @returns {boolean} true se for inteiro
     */
    static isInteger(value) {
        return Number.isInteger(Number(value));
    }

    /**
     * Verifica se é um número decimal
     * @param {string|number} value Valor a ser verificado
     * @param {number} decimals Número de casas decimais
     * @returns {boolean} true se for decimal
     */
    static isDecimal(value, decimals = 2) {
        if (!this.isNumeric(value)) return false;
        const regex = new RegExp(`^-?\\d*\\.?\\d{0,${decimals}}$`);
        return regex.test(value.toString());
    }

    /**
     * Verifica se contém apenas letras
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se contiver apenas letras
     */
    static isAlpha(value) {
        return /^[a-zA-Z]+$/.test(value);
    }

    /**
     * Verifica se contém apenas letras e números
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se contiver apenas letras e números
     */
    static isAlphaNum(value) {
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    /**
     * Verifica se contém apenas letras, números, traços e underscores
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se contiver apenas letras, números, traços e underscores
     */
    static isAlphaDash(value) {
        return /^[a-zA-Z0-9_-]+$/.test(value);
    }

    /**
     * Verifica se é uma data válida
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se for data válida
     */
    static isDate(value) {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Verifica se é uma data no formato especificado
     * @param {string} value Valor a ser verificado
     * @param {string} format Formato da data
     * @returns {boolean} true se for data válida
     */
    static isDateFormat(value, format) {
        // Implementar validação de formato de data
        return this.isDate(value);
    }

    /**
     * Verifica se é uma URL válida
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se for URL válida
     */
    static isUrl(value) {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Verifica se é um IP válido
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se for IP válido
     */
    static isIp(value) {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(value) || ipv6Regex.test(value);
    }

    /**
     * Verifica se é um JSON válido
     * @param {string} value Valor a ser verificado
     * @returns {boolean} true se for JSON válido
     */
    static isJson(value) {
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = Validator;