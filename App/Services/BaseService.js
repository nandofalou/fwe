const Event = require('../Helpers/Event');
const Log = require('../Helpers/Log');
const Service = require('../Models/Service');

/**
 * Classe base para todos os serviços
 * Fornece funcionalidades comuns como controle de ciclo de vida,
 * monitoramento de recursos e integração com o framework
 */
class BaseService {
    constructor(name, options = {}) {
        this.name = name;
        this.status = 'stopped'; // running, stopped, error, paused
        this.serviceId = null;
        this.interval = null;
        this.timer = null;
        this.startTime = null;
        this.lastActivity = null;
        this.errorCount = 0;
        this.executionCount = 0;
        
        // Configurações
        this.config = {
            autoStart: options.autoStart || false,
            interval: options.interval || 60000, // 1 minuto padrão
            maxRetries: options.maxRetries || 3,
            maxMemoryUsage: options.maxMemoryUsage || 100 * 1024 * 1024, // 100MB
            maxCpuUsage: options.maxCpuUsage || 80, // 80%
            ...options
        };

        // Helpers disponíveis
        this.helpers = {
            Event,
            Log,
            Database: require('../Helpers/Database'),
            Date: require('../Helpers/Date'),
            String: require('../Helpers/String'),
            Validation: require('../Helpers/Validation')
        };

        // Models disponíveis
        this.models = {
            Service,
            User: require('../Models/User')
        };

        // Métricas
        this.metrics = {
            memoryUsage: 0,
            cpuUsage: 0,
            executionTime: 0
        };

        // Bind methods
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.restart = this.restart.bind(this);
        this.execute = this.execute.bind(this);
        this.updateMetrics = this.updateMetrics.bind(this);

        // Registrar eventos
        this.registerEvents();
    }

    /**
     * Registra eventos do serviço
     */
    registerEvents() {
        this.helpers.Event.on('service:stop-all', () => {
            if (this.status === 'running') {
                this.stop();
            }
        });
    }

    /**
     * Inicia o serviço
     */
    async start(parameters = {}) {
        try {
            if (this.status === 'running') {
                throw new Error('Serviço já está em execução');
            }

            this.helpers.Log.info(`Iniciando serviço: ${this.name}`, { parameters });
            
            // Criar registro no banco
            const serviceData = {
                name: this.name,
                status: 'running',
                parameters: JSON.stringify(parameters),
                started_at: new Date().toISOString()
            };

            const result = await this.models.Service.insert(serviceData);
            this.serviceId = result.insertId || result.lastID;
            
            this.status = 'running';
            this.startTime = new Date();
            this.lastActivity = new Date();
            this.errorCount = 0;
            this.executionCount = 0;

            // Executar método onStart se existir
            if (typeof this.onStart === 'function') {
                await this.onStart(parameters);
            }

            // Configurar execução periódica se houver intervalo
            if (this.config.interval > 0) {
                this.timer = setInterval(async () => {
                    await this.execute(parameters);
                }, this.config.interval);
            } else {
                // Execução única
                await this.execute(parameters);
            }

            // Emitir evento
            this.helpers.Event.emit('service:started', {
                serviceId: this.serviceId,
                name: this.name,
                parameters
            });

            this.helpers.Log.info(`Serviço iniciado com sucesso: ${this.name}`, { 
                serviceId: this.serviceId 
            });

            return { success: true, serviceId: this.serviceId };

        } catch (error) {
            this.helpers.Log.error(`Erro ao iniciar serviço: ${this.name}`, { 
                error: error.message 
            });
            
            await this.handleError(error);
            throw error;
        }
    }

    /**
     * Para o serviço
     */
    async stop() {
        try {
            if (this.status === 'stopped') {
                return { success: true, message: 'Serviço já está parado' };
            }

            this.helpers.Log.info(`Parando serviço: ${this.name}`);

            // Limpar timer se existir
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }

            // Executar método onStop se existir
            if (typeof this.onStop === 'function') {
                await this.onStop();
            }

            // Atualizar status no banco
            if (this.serviceId) {
                await this.models.Service.updateStatus(this.serviceId, 'stopped');
            }

            this.status = 'stopped';
            this.lastActivity = new Date();

            // Emitir evento
            this.helpers.Event.emit('service:stopped', {
                serviceId: this.serviceId,
                name: this.name
            });

            this.helpers.Log.info(`Serviço parado com sucesso: ${this.name}`);

            return { success: true };

        } catch (error) {
            this.helpers.Log.error(`Erro ao parar serviço: ${this.name}`, { 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Pausa o serviço
     */
    async pause() {
        if (this.status === 'running') {
            this.status = 'paused';
            this.lastActivity = new Date();
            
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }

            this.helpers.Log.info(`Serviço pausado: ${this.name}`);
            this.helpers.Event.emit('service:paused', { name: this.name });
        }
    }

    /**
     * Resume o serviço
     */
    async resume() {
        if (this.status === 'paused') {
            this.status = 'running';
            this.lastActivity = new Date();

            if (this.config.interval > 0) {
                this.timer = setInterval(async () => {
                    await this.execute();
                }, this.config.interval);
            }

            this.helpers.Log.info(`Serviço resumido: ${this.name}`);
            this.helpers.Event.emit('service:resumed', { name: this.name });
        }
    }

    /**
     * Reinicia o serviço
     */
    async restart(parameters = {}) {
        this.helpers.Log.info(`Reiniciando serviço: ${this.name}`);
        
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
        return await this.start(parameters);
    }

    /**
     * Executa a lógica principal do serviço
     * Deve ser implementado pelas classes filhas
     */
    async execute(parameters = {}) {
        const startTime = Date.now();
        
        try {
            this.lastActivity = new Date();
            this.executionCount++;

            // Verificar limites de recursos
            await this.checkResourceLimits();

            // Executar lógica do serviço
            const result = await this.run(parameters);

            // Atualizar métricas
            this.metrics.executionTime = Date.now() - startTime;
            await this.updateMetrics();

            // Emitir evento de sucesso
            this.helpers.Event.emit('service:completed', {
                serviceId: this.serviceId,
                name: this.name,
                executionTime: this.metrics.executionTime,
                result
            });

            return result;

        } catch (error) {
            this.errorCount++;
            await this.handleError(error);
            throw error;
        }
    }

    /**
     * Método principal que deve ser implementado pelas classes filhas
     */
    async run(parameters = {}) {
        throw new Error('Método run() deve ser implementado pela classe filha');
    }

    /**
     * Atualiza métricas do serviço
     */
    async updateMetrics() {
        try {
            // Obter uso de memória
            const memUsage = process.memoryUsage();
            this.metrics.memoryUsage = memUsage.heapUsed;

            // Obter uso de CPU (aproximado)
            const cpuUsage = process.cpuUsage();
            this.metrics.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

            // Atualizar no banco se tiver serviceId
            if (this.serviceId) {
                await this.models.Service.updateMetrics(
                    this.serviceId,
                    this.metrics.memoryUsage,
                    this.metrics.cpuUsage
                );
            }

        } catch (error) {
            this.helpers.Log.error('Erro ao atualizar métricas', { error: error.message });
        }
    }

    /**
     * Verifica limites de recursos
     */
    async checkResourceLimits() {
        const memUsage = process.memoryUsage();
        
        if (memUsage.heapUsed > this.config.maxMemoryUsage) {
            this.helpers.Event.emit('service:memory_high', {
                serviceId: this.serviceId,
                name: this.name,
                memoryUsage: memUsage.heapUsed,
                limit: this.config.maxMemoryUsage
            });
            
            this.helpers.Log.warning(`Uso de memória alto no serviço: ${this.name}`, {
                memoryUsage: memUsage.heapUsed,
                limit: this.config.maxMemoryUsage
            });
        }
    }

    /**
     * Trata erros do serviço
     */
    async handleError(error) {
        this.helpers.Log.error(`Erro no serviço: ${this.name}`, { 
            error: error.message,
            stack: error.stack 
        });

        // Atualizar status no banco se tiver serviceId
        if (this.serviceId) {
            await this.models.Service.updateStatus(this.serviceId, 'error', {
                error_message: error.message
            });
        }

        // Emitir evento de erro
        this.helpers.Event.emit('service:error', {
            serviceId: this.serviceId,
            name: this.name,
            error: error.message,
            errorCount: this.errorCount
        });

        // Parar serviço se exceder tentativas
        if (this.errorCount >= this.config.maxRetries) {
            this.helpers.Log.error(`Serviço parado por excesso de erros: ${this.name}`, {
                errorCount: this.errorCount,
                maxRetries: this.config.maxRetries
            });
            await this.stop();
        }
    }

    /**
     * Obtém informações do serviço
     */
    getInfo() {
        return {
            name: this.name,
            status: this.status,
            serviceId: this.serviceId,
            startTime: this.startTime,
            lastActivity: this.lastActivity,
            executionCount: this.executionCount,
            errorCount: this.errorCount,
            metrics: this.metrics,
            config: this.config
        };
    }

    /**
     * Obtém estatísticas do serviço
     */
    getStats() {
        const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        
        return {
            name: this.name,
            status: this.status,
            uptime: uptime,
            executionCount: this.executionCount,
            errorCount: this.errorCount,
            successRate: this.executionCount > 0 ? 
                ((this.executionCount - this.errorCount) / this.executionCount * 100).toFixed(2) : 0,
            memoryUsage: this.metrics.memoryUsage,
            cpuUsage: this.metrics.cpuUsage,
            lastActivity: this.lastActivity
        };
    }
}

module.exports = BaseService; 