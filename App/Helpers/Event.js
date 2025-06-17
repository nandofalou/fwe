const EventEmitter = require('events');

/**
 * Classe para manipulação de eventos
 */
class Event extends EventEmitter {
    constructor() {
        super();
        this.events = new Map();
    }

    /**
     * Registra um evento
     * @param {string} event Nome do evento
     * @param {Function} listener Função de callback
     */
    on(event, listener) {
        super.on(event, listener);
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
    }

    /**
     * Registra um evento que será executado apenas uma vez
     * @param {string} event Nome do evento
     * @param {Function} listener Função de callback
     */
    once(event, listener) {
        super.once(event, listener);
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
    }

    /**
     * Remove um evento
     * @param {string} event Nome do evento
     * @param {Function} listener Função de callback
     */
    off(event, listener) {
        super.off(event, listener);
        if (this.events.has(event)) {
            const listeners = this.events.get(event);
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            if (listeners.length === 0) {
                this.events.delete(event);
            }
        }
    }

    /**
     * Remove todos os eventos
     * @param {string} event Nome do evento
     */
    removeAllListeners(event) {
        super.removeAllListeners(event);
        this.events.delete(event);
    }

    /**
     * Emite um evento
     * @param {string} event Nome do evento
     * @param {...*} args Argumentos do evento
     */
    emit(event, ...args) {
        super.emit(event, ...args);
    }

    /**
     * Obtém os listeners de um evento
     * @param {string} event Nome do evento
     * @returns {Array} Lista de listeners
     */
    listeners(event) {
        return this.events.get(event) || [];
    }

    /**
     * Obtém o número de listeners de um evento
     * @param {string} event Nome do evento
     * @returns {number} Número de listeners
     */
    listenerCount(event) {
        return this.events.get(event)?.length || 0;
    }

    /**
     * Obtém todos os eventos registrados
     * @returns {Array} Lista de eventos
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Obtém o número total de eventos
     * @returns {number} Número de eventos
     */
    eventCount() {
        return this.events.size;
    }

    /**
     * Verifica se um evento existe
     * @param {string} event Nome do evento
     * @returns {boolean} true se existir
     */
    hasEvent(event) {
        return this.events.has(event);
    }

    /**
     * Limpa todos os eventos
     */
    clear() {
        this.events.clear();
        this.removeAllListeners();
    }
}

module.exports = new Event(); 