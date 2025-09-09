const BaseService = require('./BaseService');

/**
 * Serviço oculto - não será carregado pelo ServiceManager
 * Este serviço é usado apenas para desenvolvimento e testes
 */
class HiddenService extends BaseService {
    constructor() {
        super();
        this.name = '.HiddenService';
        this.description = 'Serviço oculto (não carregado)';
        
        // Configuração padrão
        this.config = {
            autoStart: false,
            interval: 30000, // 30 segundos
            maxRetries: 2,
            maxMemoryUsage: 25 * 1024 * 1024, // 25MB
            maxCpuUsage: 50
        };
    }

    /**
     * Execução principal do serviço
     */
    async execute() {
        this.log.info('Serviço oculto executando...');
        
        // Simular algum trabalho
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.log.info('Serviço oculto concluído');
        return { success: true, message: 'Oculto concluído' };
    }

    /**
     * Informações específicas do serviço
     */
    getInfo() {
        return {
            ...super.getInfo(),
            hidden: true,
            development: true
        };
    }
}

module.exports = HiddenService;
