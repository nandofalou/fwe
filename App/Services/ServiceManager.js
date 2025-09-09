const fs = require('fs');
const path = require('path');
const Event = require('../Helpers/Event');
const Log = require('../Helpers/Log');
const Service = require('../Models/Service');

/**
 * Gerenciador de serviços
 * Controla o ciclo de vida de todos os serviços
 */
class ServiceManager {
    static instance = null;

    static getInstance() {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    constructor() {
        this.services = new Map();
        this.serviceInstances = new Map();
        this.isInitialized = false;
        
        // Registrar eventos
        this.registerEvents();
    }

    /**
     * Registra eventos do gerenciador
     */
    registerEvents() {
        Event.on('service:started', (data) => {
            Log.info('Serviço iniciado via gerenciador', data);
        });

        Event.on('service:stopped', (data) => {
            Log.info('Serviço parado via gerenciador', data);
        });

        Event.on('service:error', (data) => {
            Log.error('Erro em serviço via gerenciador', data);
        });
    }

    /**
     * Inicializa o gerenciador de serviços
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            Log.info('Inicializando gerenciador de serviços');
            
            // Carregar serviços disponíveis
            await this.loadAvailableServices();
            
            // Inicializar serviços com autoStart
            await this.initializeAutoStartServices();
            
            this.isInitialized = true;
            Log.info('Gerenciador de serviços inicializado com sucesso');
            
        } catch (error) {
            Log.error('Erro ao inicializar gerenciador de serviços', { error: error.message });
            throw error;
        }
    }

    /**
     * Carrega serviços disponíveis da pasta Services
     */
    async loadAvailableServices() {
        const servicesPath = path.join(__dirname);
        
        try {
            const files = fs.readdirSync(servicesPath);
            
            for (const file of files) {
                if (file.endsWith('.js') && file !== 'BaseService.js' && file !== 'ServiceManager.js') {
                    const serviceName = path.basename(file, '.js');
                    
                    // Ignorar serviços que começam com _ ou . (desenvolvimento)
                    if (serviceName.startsWith('_') || serviceName.startsWith('.')) {
                        Log.info(`Serviço ignorado (desenvolvimento): ${serviceName}`);
                        continue;
                    }
                    
                    const servicePath = path.join(servicesPath, file);
                    
                    try {
                        const ServiceClass = require(servicePath);
                        this.services.set(serviceName, {
                            name: serviceName,
                            path: servicePath,
                            class: ServiceClass
                        });
                        
                        Log.info(`Serviço carregado: ${serviceName}`);
                    } catch (error) {
                        Log.error(`Erro ao carregar serviço: ${serviceName}`, { error: error.message });
                    }
                }
            }
            
        } catch (error) {
            Log.error('Erro ao carregar serviços', { error: error.message });
        }
    }

    /**
     * Inicializa serviços configurados para autoStart
     */
    async initializeAutoStartServices() {
        for (const [serviceName, serviceInfo] of this.services) {
            try {
                const serviceInstance = new serviceInfo.class();
                
                if (serviceInstance.config.autoStart) {
                    
                    // Passar parâmetro autoStart = true para indicar que é auto-start
                    await this.startService(serviceName, { autoStart: true });
                    Log.info(`Serviço auto-iniciado: ${serviceName}`);
                    
                }
            } catch (error) {
                Log.error(`Erro ao inicializar serviço: ${serviceName}`, { error: error.message });
            }
        }
    }

    /**
     * Obtém lista de serviços disponíveis
     */
    getAvailableServices() {
        return Array.from(this.services.keys());
    }

    /**
     * Obtém lista de serviços em execução
     */
    getRunningServices() {
        const running = [];
        for (const [name, instance] of this.serviceInstances) {
            if (instance.status === 'running') {
                running.push({
                    name,
                    ...instance.getInfo()
                });
            }
        }
        return running;
    }

    /**
     * Obtém estatísticas de todos os serviços
     */
    getAllServicesStats() {
        const stats = [];
        for (const [name, instance] of this.serviceInstances) {
            stats.push({
                name,
                ...instance.getStats()
            });
        }
        return stats;
    }

    /**
     * Inicia um serviço
     */
    async startService(serviceName, parameters = {}) {
        try {

            // Verificar se já está em execução
            if (this.serviceInstances.has(serviceName)) {
                const instance = this.serviceInstances.get(serviceName);
                if (instance.status === 'running') {
                    return { success: false, message: 'Serviço já está em execução' };
                }
            }

            // Criar nova instância
            const serviceInfo = this.services.get(serviceName);
            const serviceInstance = new serviceInfo.class();
            
            // Marcar como inicialização manual se não for autoStart
            const isAutoStart = parameters.autoStart === true;
            if (!isAutoStart) {
                parameters.manual = true;
            }
            
            // Iniciar serviço
            const result = await serviceInstance.start(parameters);
            
            // Armazenar instância
            this.serviceInstances.set(serviceName, serviceInstance);
            
            Log.info(`Serviço iniciado: ${serviceName}`, { parameters, result });
            return result;

        } catch (error) {
            Log.error(`Erro ao iniciar serviço: ${serviceName}`, { error: error.message });
            throw error;
        }
    }

    /**
     * Para um serviço
     */
    async stopService(serviceName) {
        try {
            if (!this.serviceInstances.has(serviceName)) {
                return { success: false, message: 'Serviço não está em execução' };
            }

            const instance = this.serviceInstances.get(serviceName);
            const result = await instance.stop();
            
            // Remover instância se parou com sucesso
            if (result.success) {
                this.serviceInstances.delete(serviceName);
            }
            
            Log.info(`Serviço parado: ${serviceName}`, result);
            return result;

        } catch (error) {
            Log.error(`Erro ao parar serviço: ${serviceName}`, { error: error.message });
            throw error;
        }
    }

    /**
     * Para um serviço por ID
     */
    async stopServiceById(serviceId) {
        try {
            for (const [name, instance] of this.serviceInstances) {
                if (instance.serviceId === parseInt(serviceId)) {
                    return await this.stopService(name);
                }
            }
            
            return { success: false, message: 'Serviço não encontrado' };

        } catch (error) {
            Log.error(`Erro ao parar serviço por ID: ${serviceId}`, { error: error.message });
            throw error;
        }
    }

    /**
     * Para todos os serviços
     */
    async stopAllServices() {
        try {
            Log.info('Parando todos os serviços');
            
            const results = [];
            const serviceNames = Array.from(this.serviceInstances.keys());
            
            for (const serviceName of serviceNames) {
                try {
                    const result = await this.stopService(serviceName);
                    results.push({ serviceName, ...result });
                } catch (error) {
                    results.push({ serviceName, success: false, error: error.message });
                }
            }
            
            // Emitir evento
            Event.emit('service:stop-all');
            
            Log.info('Todos os serviços foram parados', { results });
            return { success: true, results };

        } catch (error) {
            Log.error('Erro ao parar todos os serviços', { error: error.message });
            throw error;
        }
    }

    /**
     * Reinicia um serviço
     */
    async restartService(serviceName, parameters = {}) {
        try {
            Log.info(`Reiniciando serviço: ${serviceName}`);
            
            // Parar se estiver em execução
            if (this.serviceInstances.has(serviceName)) {
                await this.stopService(serviceName);
            }
            
            // Aguardar um pouco
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Iniciar novamente
            return await this.startService(serviceName, parameters);

        } catch (error) {
            Log.error(`Erro ao reiniciar serviço: ${serviceName}`, { error: error.message });
            throw error;
        }
    }

    /**
     * Obtém informações de um serviço
     */
    getServiceInfo(serviceName) {
        // Primeiro verifica se o serviço está em execução
        if (this.serviceInstances.has(serviceName)) {
            const instance = this.serviceInstances.get(serviceName);
            return instance.getInfo();
        }
        
        // Se não está em execução, verifica se está disponível
        if (this.services.has(serviceName)) {
            const serviceClass = this.services.get(serviceName);
            // Retorna informações básicas do serviço disponível
            return {
                name: serviceName,
                status: 'stopped',
                serviceId: null,
                startTime: null,
                lastActivity: null,
                config: {
                    autoStart: false,
                    interval: 30000,
                    maxRetries: 3,
                    maxMemoryUsage: 104857600,
                    maxCpuUsage: 80
                }
            };
        }
        
        return null;
    }

    /**
     * Obtém estatísticas de um serviço
     */
    getServiceStats(serviceName) {
        // Primeiro verifica se o serviço está em execução
        if (this.serviceInstances.has(serviceName)) {
            const instance = this.serviceInstances.get(serviceName);
            return instance.getStats();
        }
        
        // Se não está em execução, verifica se está disponível
        if (this.services.has(serviceName)) {
            // Retorna estatísticas vazias para serviços parados
            return {
                executionCount: 0,
                errorCount: 0,
                successRate: 0,
                uptime: 0,
                memoryUsage: 0,
                cpuUsage: 0
            };
        }
        
        return null;
    }

    /**
     * Obtém uma instância de serviço
     * @param {string} serviceName 
     * @returns {Object|null}
     */
    getService(serviceName) {
        return this.serviceInstances.get(serviceName) || null;
    }

    /**
     * Verifica se um serviço está em execução
     */
    isServiceRunning(serviceName) {
        if (!this.serviceInstances.has(serviceName)) {
            return false;
        }
        
        const instance = this.serviceInstances.get(serviceName);
        return instance.status === 'running';
    }

    /**
     * Obtém serviços do banco de dados
     */
    async getServicesFromDatabase() {
        try {
            Log.info('Buscando serviços do banco de dados...');
            
            // Teste simples para verificar se a tabela existe
            try {
                const testQuery = await Service.rawQuery('SELECT COUNT(*) as count FROM services');
                Log.info('Tabela services existe, registros:', testQuery[0]?.count || 0);
            } catch (tableError) {
                Log.error('Tabela services não existe ou erro de acesso', { error: tableError.message });
                return [];
            }
            
            const services = await Service.get();
            Log.info(`Serviços encontrados no banco: ${services.length}`);
            return services;
        } catch (error) {
            Log.error('Erro ao obter serviços do banco', { error: error.message });
            return [];
        }
    }

    /**
     * Limpa registros antigos do banco
     */
    async cleanupOldRecords() {
        try {
            // Remover registros de serviços parados há mais de 24 horas
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const sql = 'DELETE FROM services WHERE status = "stopped" AND stopped_at < ?';
            await Service.rawQuery(sql, [yesterday.toISOString()]);
            
            Log.info('Registros antigos de serviços limpos');
        } catch (error) {
            Log.error('Erro ao limpar registros antigos', { error: error.message });
        }
    }

    /**
     * Recarrega todos os serviços (útil após mudanças de código)
     */
    async reloadServices() {
        try {
            Log.info('Recarregando todos os serviços');
            
            // Parar todos os serviços
            await this.stopAllServices();
            
            // Limpar instâncias e serviços
            this.serviceInstances.clear();
            this.services.clear();
            
            // Limpar cache do Node.js para os módulos de serviço
            const servicesPath = path.join(__dirname);
            const files = fs.readdirSync(servicesPath);
            
            for (const file of files) {
                if (file.endsWith('.js') && file !== 'BaseService.js' && file !== 'ServiceManager.js') {
                    const serviceName = path.basename(file, '.js');
                    
                    // Limpar cache para todos os serviços, incluindo os de desenvolvimento
                    const servicePath = path.join(servicesPath, file);
                    delete require.cache[require.resolve(servicePath)];
                }
            }
            
            // Recarregar serviços
            await this.loadAvailableServices();
            
            // Reinicializar serviços com autoStart
            await this.initializeAutoStartServices();
            
            Log.info('Serviços recarregados com sucesso');
            
        } catch (error) {
            Log.error('Erro ao recarregar serviços', { error: error.message });
            throw error;
        }
    }

    /**
     * Desliga o gerenciador
     */
    async shutdown() {
        try {
            Log.info('Desligando gerenciador de serviços');
            
            // Parar todos os serviços
            await this.stopAllServices();
            
            // Limpar instâncias
            this.serviceInstances.clear();
            this.services.clear();
            
            this.isInitialized = false;
            Log.info('Gerenciador de serviços desligado');
            
        } catch (error) {
            Log.error('Erro ao desligar gerenciador de serviços', { error: error.message });
        }
    }
}

module.exports = ServiceManager; 