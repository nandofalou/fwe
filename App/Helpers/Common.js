const crypto = require('crypto');
const Config = require('../Config/Config');

class Common {
    static generateId() {
        return crypto.randomUUID();
    }

    static md5(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    static sha256(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    static isNullOrUndefined(value) {
        return value === null || value === undefined;
    }

    static isEmpty(value) {
        if (this.isNullOrUndefined(value)) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    static isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    static isArray(value) {
        return Array.isArray(value);
    }

    static isFunction(value) {
        return typeof value === 'function';
    }

    static isDate(value) {
        return value instanceof Date && !isNaN(value);
    }

    static isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static formatDate(date, format = 'DD/MM/YYYY') {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        const formats = {
            DD: String(date.getDate()).padStart(2, '0'),
            MM: String(date.getMonth() + 1).padStart(2, '0'),
            YYYY: date.getFullYear(),
            HH: String(date.getHours()).padStart(2, '0'),
            mm: String(date.getMinutes()).padStart(2, '0'),
            ss: String(date.getSeconds()).padStart(2, '0')
        };

        return format.replace(/DD|MM|YYYY|HH|mm|ss/g, match => formats[match]);
    }

    static formatCurrency(value, currency = 'BRL') {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(value);
    }

    static formatNumber(value, decimals = 2) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }
}

function base_url(path = '', req = null) {
    let url = '';
    if (Config.server && Config.server.baseUrl && Config.server.baseUrl.trim() !== '') {
        url = Config.server.baseUrl;
    } else if (req) {
        // Monta dinamicamente a partir do request
        const protocol = req.protocol;
        const host = req.get('host');
        url = `${protocol}://${host}`;
    } else {
        // Fallback
        const port = Config.server && Config.server.port ? Config.server.port : 9000;
        url = `http://localhost:${port}`;
    }
    if (path) {
        if (!url.endsWith('/') && !path.startsWith('/')) url += '/';
        url += path;
    }
    return url;
}

module.exports = {
    base_url,
    ...Common
};
