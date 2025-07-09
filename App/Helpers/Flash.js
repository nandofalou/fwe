const Session = require('./Session');

class Flash {
    /**
     * Define uma mensagem flash para ser exibida na próxima requisição
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo da mensagem (success, error, warning, info)
     */
    static async set(sessionId, key, message, type = 'info') {
        const flashData = {
            message: message,
            type: type,
            timestamp: new Date().toISOString()
        };
        
        return await Session.setValue(sessionId, `flash_${key}`, JSON.stringify(flashData));
    }

    /**
     * Define uma mensagem de sucesso
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @param {string} message - Mensagem a ser exibida
     */
    static async setSuccess(sessionId, key, message) {
        return await this.set(sessionId, key, message, 'success');
    }

    /**
     * Define uma mensagem de erro
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @param {string} message - Mensagem a ser exibida
     */
    static async setError(sessionId, key, message) {
        return await this.set(sessionId, key, message, 'error');
    }

    /**
     * Define uma mensagem de aviso
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @param {string} message - Mensagem a ser exibida
     */
    static async setWarning(sessionId, key, message) {
        return await this.set(sessionId, key, message, 'warning');
    }

    /**
     * Define uma mensagem informativa
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @param {string} message - Mensagem a ser exibida
     */
    static async setInfo(sessionId, key, message) {
        return await this.set(sessionId, key, message, 'info');
    }

    /**
     * Obtém uma mensagem flash e a remove da sessão
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @returns {Object|null} Dados da mensagem ou null se não existir
     */
    static async get(sessionId, key) {
        const flashData = await Session.getValue(sessionId, `flash_${key}`);
        if (flashData) {
            // Remove a mensagem da sessão após ler
            await Session.removeValue(sessionId, `flash_${key}`);
            return JSON.parse(flashData);
        }
        return null;
    }

    /**
     * Verifica se existe uma mensagem flash
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @returns {boolean} True se existe, false caso contrário
     */
    static async has(sessionId, key) {
        const flashData = await Session.getValue(sessionId, `flash_${key}`);
        return flashData !== null;
    }

    /**
     * Obtém todas as mensagens flash e as remove da sessão
     * @param {string} sessionId - ID da sessão
     * @returns {Object} Objeto com todas as mensagens flash
     */
    static async getAll(sessionId) {
        const session = await Session.get(sessionId);
        if (!session) return {};
        
        const data = JSON.parse(session.data || '{}');
        const flashMessages = {};
        const keysToRemove = [];
        
        Object.keys(data).forEach(key => {
            if (key.startsWith('flash_')) {
                const messageKey = key.replace('flash_', '');
                try {
                    const messageData = JSON.parse(data[key]);
                    flashMessages[messageKey] = messageData;
                    keysToRemove.push(key);
                } catch (error) {
                    // Ignora dados inválidos
                }
            }
        });
        
        // Remove as mensagens da sessão
        for (const key of keysToRemove) {
            await Session.removeValue(sessionId, key);
        }
        
        return flashMessages;
    }

    /**
     * Obtém mensagens flash para uso em views (não remove da sessão)
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     * @returns {Object|null} Dados da mensagem ou null se não existir
     */
    static async peek(sessionId, key) {
        const flashData = await Session.getValue(sessionId, `flash_${key}`);
        if (flashData) {
            return JSON.parse(flashData);
        }
        return null;
    }

    /**
     * Remove uma mensagem flash específica
     * @param {string} sessionId - ID da sessão
     * @param {string} key - Chave da mensagem
     */
    static async remove(sessionId, key) {
        return await Session.removeValue(sessionId, `flash_${key}`);
    }

    /**
     * Remove todas as mensagens flash
     * @param {string} sessionId - ID da sessão
     */
    static async clear(sessionId) {
        const session = await Session.get(sessionId);
        if (!session) return;
        
        const data = JSON.parse(session.data || '{}');
        const keysToRemove = Object.keys(data).filter(key => key.startsWith('flash_'));
        
        for (const key of keysToRemove) {
            await Session.removeValue(sessionId, key);
        }
    }
}

module.exports = Flash; 