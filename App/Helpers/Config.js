const fs = require('fs');
const path = require('path');
const Event = require('./Event');

/**
 * Classe para manipulação de configuração
 */
class Config {
    constructor() {
        this.event = Event;
        this.config = new Map();
    }

    /**
     * Carrega uma configuração de um arquivo
     * @param {string} file Caminho do arquivo
     */
    load(file) {
        fs.readFile(file, (err, data) => {
            if (err) {
                this.event.emit('config:error', err);
                throw err;
            }

            const config = JSON.parse(data);
            this.config = new Map(Object.entries(config));
            this.event.emit('config:loaded', file);
        });
    }

    /**
     * Salva uma configuração em um arquivo
     * @param {string} file Caminho do arquivo
     */
    save(file) {
        const config = Object.fromEntries(this.config);
        fs.writeFile(file, JSON.stringify(config, null, 2), (err) => {
            if (err) {
                this.event.emit('config:error', err);
                throw err;
            }
            this.event.emit('config:saved', file);
        });
    }

    /**
     * Obtém um valor de configuração
     * @param {string} key Chave
     * @param {*} defaultValue Valor padrão (opcional)
     * @returns {*} Valor
     */
    get(key, defaultValue = null) {
        return this.config.get(key) ?? defaultValue;
    }

    /**
     * Define um valor de configuração
     * @param {string} key Chave
     * @param {*} value Valor
     */
    set(key, value) {
        this.config.set(key, value);
        this.event.emit('config:set', key, value);
    }

    /**
     * Verifica se uma chave existe
     * @param {string} key Chave
     * @returns {boolean} true se existir
     */
    has(key) {
        return this.config.has(key);
    }

    /**
     * Remove um valor de configuração
     * @param {string} key Chave
     */
    remove(key) {
        this.config.delete(key);
        this.event.emit('config:removed', key);
    }

    /**
     * Obtém todas as configurações
     * @returns {Object} Configurações
     */
    all() {
        return Object.fromEntries(this.config);
    }

    /**
     * Limpa todas as configurações
     */
    clear() {
        this.config.clear();
        this.event.emit('config:cleared');
    }

    /**
     * Recarrega as configurações de um arquivo
     * @param {string} file Caminho do arquivo
     */
    reload(file) {
        this.clear();
        this.load(file);
    }

    /**
     * Obtém um valor de configuração
     * @param {string} key Chave
     * @param {*} defaultValue Valor padrão (opcional)
     * @returns {*} Valor
     */
    getValue(key, defaultValue = null) {
        return this.get(key, defaultValue);
    }

    /**
     * Define um valor de configuração
     * @param {string} key Chave
     * @param {*} value Valor
     */
    setValue(key, value) {
        this.set(key, value);
    }

    /**
     * Remove um valor de configuração
     * @param {string} key Chave
     */
    removeValue(key) {
        this.remove(key);
    }

    /**
     * Verifica se um valor existe
     * @param {string} key Chave
     * @returns {boolean} true se existir
     */
    hasValue(key) {
        return this.has(key);
    }

    /**
     * Obtém todas as chaves
     * @returns {Array} Chaves
     */
    keys() {
        return Array.from(this.config.keys());
    }

    /**
     * Obtém todos os valores
     * @returns {Array} Valores
     */
    values() {
        return Array.from(this.config.values());
    }
}

module.exports = new Config(); 