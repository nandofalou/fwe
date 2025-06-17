/**
 * Converte uma string para camelCase
 * @param {string} str String a ser convertida
 * @returns {string} String em camelCase
 */
function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * Converte uma string para snake_case
 * @param {string} str String a ser convertida
 * @returns {string} String em snake_case
 */
function toSnakeCase(str) {
    return str
        .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        .replace(/^_/, '');
}

/**
 * Converte uma string para kebab-case
 * @param {string} str String a ser convertida
 * @returns {string} String em kebab-case
 */
function toKebabCase(str) {
    return str
        .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
        .replace(/^-/, '');
}

/**
 * Converte uma string para PascalCase
 * @param {string} str String a ser convertida
 * @returns {string} String em PascalCase
 */
function toPascalCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^[a-z]/, c => c.toUpperCase());
}

/**
 * Converte uma string para Title Case
 * @param {string} str String a ser convertida
 * @returns {string} String em Title Case
 */
function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Trunca uma string para um tamanho máximo
 * @param {string} str String a ser truncada
 * @param {number} maxLength Tamanho máximo
 * @param {string} suffix Sufixo a ser adicionado
 * @returns {string} String truncada
 */
function truncate(str, maxLength = 100, suffix = '...') {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove acentos de uma string
 * @param {string} str String a ser convertida
 * @returns {string} String sem acentos
 */
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera um slug a partir de uma string
 * @param {string} str String a ser convertida
 * @returns {string} Slug gerado
 */
function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Verifica se uma string contém outra
 * @param {string} str String principal
 * @param {string} search String a ser procurada
 * @param {boolean} caseSensitive Case sensitive
 * @returns {boolean} true se contém
 */
function contains(str, search, caseSensitive = false) {
    if (!caseSensitive) {
        str = str.toLowerCase();
        search = search.toLowerCase();
    }
    return str.includes(search);
}

/**
 * Substitui todas as ocorrências em uma string
 * @param {string} str String principal
 * @param {string} search String a ser substituída
 * @param {string} replace String substituta
 * @returns {string} String com substituições
 */
function replaceAll(str, search, replace) {
    return str.split(search).join(replace);
}

/**
 * Remove espaços em branco no início e fim de uma string
 * @param {string} str String a ser processada
 * @returns {string} String sem espaços
 */
function trim(str) {
    return str.trim();
}

/**
 * Remove espaços em branco extras de uma string
 * @param {string} str String a ser processada
 * @returns {string} String sem espaços extras
 */
function normalizeWhitespace(str) {
    return str.replace(/\s+/g, ' ').trim();
}

/**
 * Verifica se uma string está vazia
 * @param {string} str String a ser verificada
 * @returns {boolean} true se vazia
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Verifica se uma string é um email válido
 * @param {string} str String a ser verificada
 * @returns {boolean} true se for email válido
 */
function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/**
 * Verifica se uma string é uma URL válida
 * @param {string} str String a ser verificada
 * @returns {boolean} true se for URL válida
 */
function isUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    toCamelCase,
    toSnakeCase,
    toKebabCase,
    toPascalCase,
    toTitleCase,
    truncate,
    removeAccents,
    slugify,
    contains,
    replaceAll,
    trim,
    normalizeWhitespace,
    isEmpty,
    isEmail,
    isUrl
}; 