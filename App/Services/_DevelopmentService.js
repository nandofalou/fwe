const BaseService = require('./BaseService');

/**
 * Serviço de desenvolvimento - não será carregado pelo ServiceManager
 * Este serviço é usado apenas para desenvolvimento e testes
 */
class DevelopmentService extends BaseService {
    constructor() {
        super();
        this.name = '_DevelopmentService';
        this.description = 'Serviço de desenvolvimento (não carregado)';
        
        // Configuração padrão
        this.config = {
            autoStart: false,
            interval: 60000, // 1 minuto
            maxRetries: 3,
            maxMemoryUsage: 50 * 1024 * 1024, // 50MB
            maxCpuUsage: 80
        };
    }

    /**
     * Execução principal do serviço
     */
    async execute() {
        this.log.info('Serviço de desenvolvimento executando...');
        
        // Simular algum trabalho
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.log.info('Serviço de desenvolvimento concluído');
        return { success: true, message: 'Desenvolvimento concluído' };
    }

    /**
     * Informações específicas do serviço
     */
    getInfo() {
        return {
            ...super.getInfo(),
            development: true,
            hidden: true
        };
    }
}

module.exports = DevelopmentService;
