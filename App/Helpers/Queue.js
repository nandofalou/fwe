const Event = require('./Event');

/**
 * Classe para manipulação de filas
 */
class Queue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.event = Event;
    }

    /**
     * Adiciona um item à fila
     * @param {*} item Item a ser adicionado
     * @param {number} priority Prioridade do item (opcional)
     */
    add(item, priority = 0) {
        this.queue.push({ item, priority });
        this.queue.sort((a, b) => b.priority - a.priority);
        this.event.emit('queue:added', item);
        this.process();
    }

    /**
     * Processa a fila
     */
    async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const { item } = this.queue.shift();

        try {
            this.event.emit('queue:processing', item);
            await this.processItem(item);
            this.event.emit('queue:processed', item);
        } catch (error) {
            this.event.emit('queue:error', error, item);
        } finally {
            this.processing = false;
            if (this.queue.length > 0) {
                this.process();
            }
        }
    }

    /**
     * Processa um item da fila
     * @param {*} item Item a ser processado
     */
    async processItem(item) {
        if (typeof item === 'function') {
            await item();
        } else if (item && typeof item.process === 'function') {
            await item.process();
        } else {
            throw new Error('Item inválido na fila');
        }
    }

    /**
     * Obtém o tamanho da fila
     * @returns {number} Tamanho da fila
     */
    size() {
        return this.queue.length;
    }

    /**
     * Verifica se a fila está vazia
     * @returns {boolean} true se estiver vazia
     */
    isEmpty() {
        return this.queue.length === 0;
    }

    /**
     * Limpa a fila
     */
    clear() {
        this.queue = [];
        this.event.emit('queue:cleared');
    }

    /**
     * Obtém o próximo item da fila sem removê-lo
     * @returns {*} Próximo item
     */
    peek() {
        return this.queue[0]?.item;
    }

    /**
     * Obtém todos os itens da fila
     * @returns {Array} Lista de itens
     */
    items() {
        return this.queue.map(item => item.item);
    }

    /**
     * Remove um item específico da fila
     * @param {*} item Item a ser removido
     * @returns {boolean} true se o item foi removido
     */
    remove(item) {
        const index = this.queue.findIndex(queueItem => queueItem.item === item);
        if (index !== -1) {
            this.queue.splice(index, 1);
            this.event.emit('queue:removed', item);
            return true;
        }
        return false;
    }

    /**
     * Pausa o processamento da fila
     */
    pause() {
        this.processing = true;
        this.event.emit('queue:paused');
    }

    /**
     * Resume o processamento da fila
     */
    resume() {
        this.processing = false;
        this.event.emit('queue:resumed');
        this.process();
    }
}

module.exports = new Queue();