/**
 * Formata um número para moeda brasileira
 * @param {number} value Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata um número com separador de milhares
 * @param {number} value Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatNumber(value) {
    if (!value) return '0';
    return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata um número com casas decimais
 * @param {number} value Valor a ser formatado
 * @param {number} decimals Número de casas decimais
 * @returns {string} Valor formatado
 */
function formatDecimal(value, decimals = 2) {
    if (!value) return '0'.padEnd(decimals + 2, '0');
    return Number(value).toFixed(decimals);
}

/**
 * Formata um número como porcentagem
 * @param {number} value Valor a ser formatado
 * @param {number} decimals Número de casas decimais
 * @returns {string} Valor formatado
 */
function formatPercent(value, decimals = 2) {
    if (!value) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Verifica se um valor é um número
 * @param {*} value Valor a ser verificado
 * @returns {boolean} true se for número
 */
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Arredonda um número
 * @param {number} value Valor a ser arredondado
 * @param {number} decimals Número de casas decimais
 * @returns {number} Valor arredondado
 */
function round(value, decimals = 0) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Arredonda um número para cima
 * @param {number} value Valor a ser arredondado
 * @param {number} decimals Número de casas decimais
 * @returns {number} Valor arredondado
 */
function ceil(value, decimals = 0) {
    return Number(Math.ceil(value + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Arredonda um número para baixo
 * @param {number} value Valor a ser arredondado
 * @param {number} decimals Número de casas decimais
 * @returns {number} Valor arredondado
 */
function floor(value, decimals = 0) {
    return Number(Math.floor(value + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Gera um número aleatório entre min e max
 * @param {number} min Valor mínimo
 * @param {number} max Valor máximo
 * @returns {number} Número aleatório
 */
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Verifica se um número está entre dois valores
 * @param {number} value Valor a ser verificado
 * @param {number} min Valor mínimo
 * @param {number} max Valor máximo
 * @returns {boolean} true se estiver entre
 */
function isBetween(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Limita um número entre dois valores
 * @param {number} value Valor a ser limitado
 * @param {number} min Valor mínimo
 * @param {number} max Valor máximo
 * @returns {number} Valor limitado
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

module.exports = {
    formatCurrency,
    formatNumber,
    formatDecimal,
    formatPercent,
    isNumber,
    round,
    ceil,
    floor,
    random,
    isBetween,
    clamp
}; 