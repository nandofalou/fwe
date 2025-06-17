const fs = require('fs');
const path = require('path');
const os = require('os');
const Event = require('./Event');

/**
 * Classe para manipulação de cache
 */
class Cache {
    constructor() {
        this.cacheDir = path.join(os.homedir(), 'fwe', 'cache');
        this.createCacheDir();
        this.cache = new Map();
        this.ttl = new Map();
        this.event = Event;
    }

    /**
     * Cria o diretório de cache
     */
    createCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Obtém o caminho do arquivo de cache
     * @param {string} key Chave do cache
     * @returns {string} Caminho do arquivo
     */
    getCachePath(key) {
        return path.join(this.cacheDir, `${key}.json`);
    }

    /**
     * Define um valor no cache
     * @param {string} key Chave
     * @param {*} value Valor
     * @param {number} ttl Tempo de vida em segundos (opcional)
     */
    set(key, value, ttl = null) {
        this.cache.set(key, value);
        
        if (ttl) {
            const timeout = setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
            
            this.ttl.set(key, timeout);
        }

        this.event.emit('cache:set', key, value, ttl);
    }

    /**
     * Obtém um valor do cache
     * @param {string} key Chave
     * @param {*} defaultValue Valor padrão (opcional)
     * @returns {*} Valor do cache ou valor padrão
     */
    get(key, defaultValue = null) {
        const value = this.cache.get(key);

        if (value === undefined) {
            this.event.emit('cache:miss', key);
            return defaultValue;
        }

        this.event.emit('cache:hit', key, value);
        return value;
    }

    /**
     * Verifica se uma chave existe no cache
     * @param {string} key Chave
     * @returns {boolean} true se existir
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Remove um valor do cache
     * @param {string} key Chave
     * @returns {boolean} true se o valor foi removido
     */
    delete(key) {
        const timeout = this.ttl.get(key);
        if (timeout) {
            clearTimeout(timeout);
            this.ttl.delete(key);
        }

        const exists = this.cache.has(key);
        if (exists) {
            this.cache.delete(key);
            this.event.emit('cache:deleted', key);
        }
        return exists;
    }

    /**
     * Limpa todo o cache
     */
    clear() {
        for (const timeout of this.ttl.values()) {
            clearTimeout(timeout);
        }

        this.cache.clear();
        this.ttl.clear();
        this.event.emit('cache:cleared');
    }

    /**
     * Obtém todas as chaves do cache
     * @returns {Array} Lista de chaves
     */
    keys() {
        return Array.from(this.cache.keys());
    }

    /**
     * Obtém todos os valores do cache
     * @returns {Array} Lista de valores
     */
    values() {
        return Array.from(this.cache.values());
    }

    /**
     * Obtém o tamanho do cache
     * @returns {number} Tamanho do cache
     */
    size() {
        return this.cache.size;
    }

    /**
     * Obtém o tempo restante de uma chave
     * @param {string} key Chave
     * @returns {number|null} Tempo restante em segundos ou null
     */
    ttl(key) {
        if (!this.ttl.has(key)) {
            return null;
        }

        const expiry = this.ttl.get(key);
        const remaining = Math.ceil((expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : null;
    }

    /**
     * Incrementa um valor numérico
     * @param {string} key Chave
     * @param {number} amount Quantidade (opcional)
     * @returns {number} Novo valor
     */
    increment(key, amount = 1) {
        const value = this.get(key, 0);
        if (typeof value !== 'number') {
            throw new Error('Valor não é numérico');
        }

        const newValue = value + amount;
        this.set(key, newValue);
        return newValue;
    }

    /**
     * Decrementa um valor numérico
     * @param {string} key Chave
     * @param {number} amount Quantidade (opcional)
     * @returns {number} Novo valor
     */
    decrement(key, amount = 1) {
        return this.increment(key, -amount);
    }

    /**
     * Persiste o cache em um arquivo
     * @param {string} file Caminho do arquivo
     */
    persist(file) {
        const data = {
            cache: Array.from(this.cache.entries()),
            ttl: Array.from(this.ttl.entries())
        };

        fs.writeFileSync(file, JSON.stringify(data));
        this.event.emit('cache:persisted', file);
    }

    /**
     * Carrega o cache de um arquivo
     * @param {string} file Caminho do arquivo
     */
    load(file) {
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file));
            this.cache = new Map(data.cache);
            this.ttl = new Map(data.ttl);
            this.event.emit('cache:loaded', file);
        }
    }

    /**
     * Obtém múltiplos valores do cache
     * @param {Array} keys Lista de chaves
     * @returns {Object} Valores do cache
     */
    getMany(keys) {
        const result = {};
        for (const key of keys) {
            result[key] = this.get(key);
        }
        return result;
    }

    /**
     * Define múltiplos valores no cache
     * @param {Object} values Valores
     * @param {number} ttl Tempo de vida em segundos (opcional)
     */
    setMany(values, ttl = null) {
        for (const [key, value] of Object.entries(values)) {
            this.set(key, value, ttl);
        }
    }

    /**
     * Remove múltiplos valores do cache
     * @param {Array} keys Lista de chaves
     * @returns {number} Número de valores removidos
     */
    deleteMany(keys) {
        let count = 0;
        for (const key of keys) {
            if (this.delete(key)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Obtém um valor do cache ou o define se não existir
     * @param {string} key Chave
     * @param {Function} callback Função para gerar o valor
     * @param {number} ttl Tempo de vida em segundos (opcional)
     * @returns {*} Valor do cache
     */
    remember(key, callback, ttl = null) {
        if (this.has(key)) {
            return this.get(key);
        }

        const value = callback();
        this.set(key, value, ttl);
        return value;
    }

    /**
     * Obtém um valor do cache ou o define se não existir
     * @param {string} key Chave
     * @param {Function} callback Função para gerar o valor
     * @param {number} ttl Tempo de vida em segundos (opcional)
     * @returns {Promise<*>} Valor do cache
     */
    async rememberAsync(key, callback, ttl = null) {
        if (this.has(key)) {
            return this.get(key);
        }

        const value = await callback();
        this.set(key, value, ttl);
        return value;
    }
}

module.exports = new Cache(); 