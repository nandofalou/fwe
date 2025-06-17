/**
 * Formata uma data para o formato brasileiro
 * @param {Date|string} date Data a ser formatada
 * @returns {string} Data formatada
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data e hora para o formato brasileiro
 * @param {Date|string} date Data a ser formatada
 * @returns {string} Data e hora formatada
 */
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
}

/**
 * Adiciona dias a uma data
 * @param {Date|string} date Data base
 * @param {number} days Número de dias
 * @returns {Date} Nova data
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Adiciona meses a uma data
 * @param {Date|string} date Data base
 * @param {number} months Número de meses
 * @returns {Date} Nova data
 */
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

/**
 * Adiciona anos a uma data
 * @param {Date|string} date Data base
 * @param {number} years Número de anos
 * @returns {Date} Nova data
 */
function addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param {Date|string} date1 Primeira data
 * @param {Date|string} date2 Segunda data
 * @returns {number} Diferença em dias
 */
function diffInDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se uma data é válida
 * @param {Date|string} date Data a ser verificada
 * @returns {boolean} true se válida
 */
function isValidDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
}

/**
 * Obtém o primeiro dia do mês
 * @param {Date|string} date Data base
 * @returns {Date} Primeiro dia do mês
 */
function firstDayOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    return d;
}

/**
 * Obtém o último dia do mês
 * @param {Date|string} date Data base
 * @returns {Date} Último dia do mês
 */
function lastDayOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d;
}

/**
 * Verifica se uma data está entre duas outras
 * @param {Date|string} date Data a ser verificada
 * @param {Date|string} start Data inicial
 * @param {Date|string} end Data final
 * @returns {boolean} true se estiver entre
 */
function isBetween(date, start, end) {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    return d >= s && d <= e;
}

/**
 * Obtém a idade a partir de uma data de nascimento
 * @param {Date|string} birthDate Data de nascimento
 * @returns {number} Idade
 */
function getAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

module.exports = {
    formatDate,
    formatDateTime,
    addDays,
    addMonths,
    addYears,
    diffInDays,
    isValidDate,
    firstDayOfMonth,
    lastDayOfMonth,
    isBetween,
    getAge
}; 