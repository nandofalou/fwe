/**
 * Helper de Data inspirado no CodeIgniter
 */
class DateHelper {
    /**
     * Retorna a data/hora atual (Date ou string)
     * @param {boolean} asString - Se true, retorna em formato ISO (YYYY-MM-DD HH:mm:ss)
     * @returns {Date|string}
     */
    static now(asString = false) {
        const d = new Date();
        if (asString) return this.toSql(d);
        return d;
    }

    /**
     * Converte para data (YYYY-MM-DD)
     * @param {Date|string} date
     * @returns {string}
     */
    static toDate(date) {
        const d = new Date(date);
        return d.toISOString().slice(0, 10);
    }

    /**
     * Converte para data/hora (YYYY-MM-DD HH:mm:ss)
     * @param {Date|string} date
     * @returns {string}
     */
    static toDateTime(date) {
        return this.toSql(date);
    }

    /**
     * Converte para hora (HH:mm:ss)
     * @param {Date|string} date
     * @returns {string}
     */
    static toTime(date) {
        const d = new Date(date);
        return d.toTimeString().slice(0, 8);
    }

    /**
     * Formata data/hora customizada
     * @param {Date|string} date
     * @param {string} format Ex: 'DD/MM/YYYY HH:mm:ss'
     * @returns {string}
     */
    static format(date, format = 'DD/MM/YYYY HH:mm:ss') {
        const d = new Date(date);
        const map = {
            DD: String(d.getDate()).padStart(2, '0'),
            MM: String(d.getMonth() + 1).padStart(2, '0'),
            YYYY: d.getFullYear(),
            HH: String(d.getHours()).padStart(2, '0'),
            mm: String(d.getMinutes()).padStart(2, '0'),
            ss: String(d.getSeconds()).padStart(2, '0')
        };
        return format.replace(/DD|MM|YYYY|HH|mm|ss/g, m => map[m]);
    }

    /**
     * Soma dias
     * @param {Date|string} date
     * @param {number} days
     * @returns {Date}
     */
    static addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    /**
     * Soma meses
     * @param {Date|string} date
     * @param {number} months
     * @returns {Date}
     */
    static addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }

    /**
     * Soma anos
     * @param {Date|string} date
     * @param {number} years
     * @returns {Date}
     */
    static addYears(date, years) {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() + years);
        return d;
    }

    /**
     * Diferença em dias
     * @param {Date|string} date1
     * @param {Date|string} date2
     * @returns {number}
     */
    static diffInDays(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    }

    /**
     * Diferença em horas
     * @param {Date|string} date1
     * @param {Date|string} date2
     * @returns {number}
     */
    static diffInHours(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.floor((d2 - d1) / (1000 * 60 * 60));
    }

    /**
     * Diferença em minutos
     * @param {Date|string} date1
     * @param {Date|string} date2
     * @returns {number}
     */
    static diffInMinutes(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.floor((d2 - d1) / (1000 * 60));
    }

    /**
     * Verifica se a data é válida
     * @param {Date|string} date
     * @returns {boolean}
     */
    static isValid(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Verifica se uma data está entre duas outras
     * @param {Date|string} date
     * @param {Date|string} start
     * @param {Date|string} end
     * @returns {boolean}
     */
    static isBetween(date, start, end) {
        const d = new Date(date);
        const s = new Date(start);
        const e = new Date(end);
        return d >= s && d <= e;
    }

    /**
     * Retorna data/hora no formato SQL (YYYY-MM-DD HH:mm:ss)
     * @param {Date|string} date
     * @returns {string}
     */
    static toSql(date) {
        const d = new Date(date);
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0') + ':' +
            String(d.getSeconds()).padStart(2, '0');
    }

    /**
     * Retorna timestamp (milissegundos)
     * @param {Date|string} date
     * @returns {number}
     */
    static toTimestamp(date) {
        return new Date(date).getTime();
    }
}

module.exports = DateHelper; 