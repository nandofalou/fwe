const crypto = require('crypto');
const Event = require('./Event');

/**
 * Classe para manipulação de sessão
 */
class Session {
    constructor() {
        this.event = Event;
        this.sessions = new Map();
    }

    /**
     * Gera um ID de sessão
     * @returns {string} ID de sessão
     */
    generateId() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Cria uma nova sessão
     * @param {string} id ID da sessão (opcional)
     * @param {number} ttl Tempo de vida em segundos (opcional)
     * @returns {string} ID da sessão
     */
    create(id = null, ttl = null) {
        const sessionId = id || this.generateId();
        const session = {
            id: sessionId,
            data: new Map(),
            created: Date.now(),
            lastAccessed: Date.now()
        };

        this.sessions.set(sessionId, session);

        if (ttl) {
            setTimeout(() => {
                this.destroy(sessionId);
            }, ttl * 1000);
        }

        this.event.emit('session:created', sessionId);
        return sessionId;
    }

    /**
     * Obtém uma sessão
     * @param {string} id ID da sessão
     * @returns {Object|null} Sessão
     */
    get(id) {
        const session = this.sessions.get(id);

        if (!session) {
            this.event.emit('session:not_found', id);
            return null;
        }

        session.lastAccessed = Date.now();
        this.event.emit('session:accessed', id);
        return session;
    }

    /**
     * Atualiza uma sessão
     * @param {string} id ID da sessão
     * @param {Object} data Dados
     * @returns {boolean} true se atualizado
     */
    update(id, data) {
        const session = this.get(id);

        if (!session) {
            return false;
        }

        for (const [key, value] of Object.entries(data)) {
            session.data.set(key, value);
        }

        this.event.emit('session:updated', id, data);
        return true;
    }

    /**
     * Destrói uma sessão
     * @param {string} id ID da sessão
     * @returns {boolean} true se destruído
     */
    destroy(id) {
        if (!this.sessions.has(id)) {
            return false;
        }

        this.sessions.delete(id);
        this.event.emit('session:destroyed', id);
        return true;
    }

    /**
     * Limpa todas as sessões
     */
    clear() {
        this.sessions.clear();
        this.event.emit('session:cleared');
    }

    /**
     * Obtém o número de sessões ativas
     * @returns {number} Número de sessões
     */
    count() {
        return this.sessions.size;
    }

    /**
     * Verifica se uma sessão existe
     * @param {string} id ID da sessão
     * @returns {boolean} true se existir
     */
    exists(id) {
        return this.sessions.has(id);
    }

    /**
     * Obtém a data de criação de uma sessão
     * @param {string} id ID da sessão
     * @returns {number|null} Data de criação
     */
    getCreatedAt(id) {
        const session = this.get(id);
        return session ? session.created : null;
    }

    /**
     * Obtém a data do último acesso de uma sessão
     * @param {string} id ID da sessão
     * @returns {number|null} Data do último acesso
     */
    getLastAccessedAt(id) {
        const session = this.get(id);
        return session ? session.lastAccessed : null;
    }

    /**
     * Obtém um valor de uma sessão
     * @param {string} id ID da sessão
     * @param {string} key Chave
     * @param {*} defaultValue Valor padrão (opcional)
     * @returns {*} Valor
     */
    getValue(id, key, defaultValue = null) {
        const session = this.get(id);

        if (!session) {
            return defaultValue;
        }

        return session.data.get(key) ?? defaultValue;
    }

    /**
     * Define um valor em uma sessão
     * @param {string} id ID da sessão
     * @param {string} key Chave
     * @param {*} value Valor
     * @returns {boolean} true se definido
     */
    setValue(id, key, value) {
        const session = this.get(id);

        if (!session) {
            return false;
        }

        session.data.set(key, value);
        this.event.emit('session:value_set', id, key, value);
        return true;
    }

    /**
     * Remove um valor de uma sessão
     * @param {string} id ID da sessão
     * @param {string} key Chave
     * @returns {boolean} true se removido
     */
    removeValue(id, key) {
        const session = this.get(id);

        if (!session) {
            return false;
        }

        session.data.delete(key);
        this.event.emit('session:value_removed', id, key);
        return true;
    }

    /**
     * Verifica se um valor existe em uma sessão
     * @param {string} id ID da sessão
     * @param {string} key Chave
     * @returns {boolean} true se existir
     */
    hasValue(id, key) {
        const session = this.get(id);

        if (!session) {
            return false;
        }

        return session.data.has(key);
    }

    /**
     * Obtém todas as chaves de uma sessão
     * @param {string} id ID da sessão
     * @returns {Array} Chaves
     */
    keys(id) {
        const session = this.get(id);

        if (!session) {
            return [];
        }

        return Array.from(session.data.keys());
    }

    /**
     * Obtém todos os valores de uma sessão
     * @param {string} id ID da sessão
     * @returns {Object} Valores
     */
    values(id) {
        const session = this.get(id);

        if (!session) {
            return {};
        }

        return Object.fromEntries(session.data);
    }
}

module.exports = new Session(); 