const crypto = require('crypto');
const Event = require('./Event');
const SessionModel = require('../Models/Session');

/**
 * Classe para manipulação de sessão persistente no banco
 */
class Session {
    constructor() {
        this.event = Event;
    }

    /**
     * Gera um ID de sessão
     * @returns {string} ID de sessão
     */
    generateId() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Cria uma nova sessão no banco
     * @param {Object} options { user_id, ip_address, user_agent, data, ttl }
     * @returns {string} ID da sessão
     */
    async create(options = {}) {
        // Limpa sessões expiradas antes de criar nova sessão
        await SessionModel.deleteExpired();
        const sessionId = this.generateId();
        const now = new Date();
        const ttl = options.ttl || 60 * 60 * 24; // 1 dia padrão
        const expiresAt = new Date(now.getTime() + ttl * 1000);
        const data = options.data ? JSON.stringify(options.data) : '{}';
        await SessionModel.insert({
            id: sessionId,
            ip_address: options.ip_address || '',
            user_agent: options.user_agent || '',
            user_id: options.user_id || null,
            data,
            created_at: now,
            updated_at: now,
            expires_at: expiresAt
        });
        this.event.emit('session:created', sessionId);
        return sessionId;
    }

    /**
     * Obtém uma sessão do banco
     * @param {string} id ID da sessão
     * @returns {Object|null} Sessão
     */
    async get(id) {
        const session = await SessionModel.find(id);
        if (!session) {
            this.event.emit('session:not_found', id);
            return null;
        }
        // Verifica expiração
        if (new Date(session.expires_at) < new Date()) {
            await this.destroy(id);
            return null;
        }
        this.event.emit('session:accessed', id);
        return session;
    }

    /**
     * Atualiza dados da sessão
     * @param {string} id ID da sessão
     * @param {Object} data Dados
     * @returns {boolean}
     */
    async update(id, data) {
        const session = await this.get(id);
        if (!session) return false;
        const merged = { ...JSON.parse(session.data || '{}'), ...data };
        await SessionModel.update(id, {
            data: JSON.stringify(merged),
            updated_at: new Date()
        });
        this.event.emit('session:updated', id, data);
        return true;
    }

    /**
     * Destroi uma sessão
     * @param {string} id ID da sessão
     * @returns {boolean}
     */
    async destroy(id) {
        await SessionModel.delete(id);
        this.event.emit('session:destroyed', id);
        return true;
    }

    /**
     * Define um valor na sessão
     */
    async setValue(id, key, value) {
        const session = await this.get(id);
        if (!session) return false;
        const data = JSON.parse(session.data || '{}');
        data[key] = value;
        await this.update(id, data);
        this.event.emit('session:value_set', id, key, value);
        return true;
    }

    /**
     * Obtém um valor da sessão
     */
    async getValue(id, key, defaultValue = null) {
        const session = await this.get(id);
        if (!session) return defaultValue;
        const data = JSON.parse(session.data || '{}');
        return data[key] ?? defaultValue;
    }

    /**
     * Remove um valor da sessão
     */
    async removeValue(id, key) {
        const session = await this.get(id);
        if (!session) return false;
        const data = JSON.parse(session.data || '{}');
        delete data[key];
        await SessionModel.update(id, {
            data: JSON.stringify(data),
            updated_at: new Date()
        });
        this.event.emit('session:value_removed', id, key);
        return true;
    }
}

module.exports = new Session(); 