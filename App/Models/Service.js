const BaseModel = require('./BaseModel');

class Service extends BaseModel {
    constructor() {
        super('services');
        this.primaryKey = 'id';
        this.softDelete = false;
        this.allowedFields = [
            'name', 'status', 'started_at', 'stopped_at', 'parameters',
            'memory_usage', 'cpu_usage', 'last_activity', 'error_message',
            'created_at', 'updated_at'
        ];
    }

    /**
     * Retorna o builder padrão para DataTable de serviços
     */
    static dataTableQuery() {
        return this
            .select(`
                services.id,
                services.name,
                services.status,
                services.started_at,
                services.stopped_at,
                services.memory_usage,
                services.cpu_usage,
                services.last_activity,
                services.error_message,
                services.created_at,
                services.updated_at
            `);
    }

    /**
     * Busca serviços em execução
     */
    static async getRunning() {
        return await this.where({ status: 'running' }).get();
    }

    /**
     * Busca serviços parados
     */
    static async getStopped() {
        return await this.where({ status: 'stopped' }).get();
    }

    /**
     * Busca serviços com erro
     */
    static async getError() {
        return await this.where({ status: 'error' }).get();
    }

    /**
     * Atualiza status de um serviço
     */
    static async updateStatus(id, status, data = {}) {
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        if (status === 'running') {
            updateData.started_at = new Date().toISOString();
            updateData.stopped_at = null;
            updateData.error_message = null;
        } else if (status === 'stopped' || status === 'error') {
            updateData.stopped_at = new Date().toISOString();
        }

        Object.assign(updateData, data);
        return await this.update(id, updateData);
    }

    /**
     * Atualiza métricas de um serviço
     */
    static async updateMetrics(id, memoryUsage, cpuUsage) {
        return await this.update(id, {
            memory_usage: memoryUsage,
            cpu_usage: cpuUsage,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
}

module.exports = Service; 