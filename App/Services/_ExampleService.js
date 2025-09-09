const BaseService = require('./BaseService');

/**
 * Serviço de exemplo
 * Demonstra como criar um serviço básico
 */
class ExampleService extends BaseService {
    constructor() {
        super('ExampleService', {
            autoStart: false,
            interval: 30000, // 30 segundos
            maxRetries: 3,
            maxMemoryUsage: 50 * 1024 * 1024 // 50MB
        });
        
        this.counter = 0;
    }

    /**
     * Executado quando o serviço inicia
     */
    async onStart(parameters) {
        this.helpers.Log.info('ExampleService iniciado', { parameters });
        this.counter = 0;
    }

    /**
     * Executado quando o serviço para
     */
    async onStop() {
        this.helpers.Log.info('ExampleService parado', { 
            totalExecutions: this.counter 
        });
    }

    /**
     * Lógica principal do serviço
     */
    async run(parameters = {}) {
        this.counter++;
        
        const message = parameters.message || 'Execução padrão';
        const delay = parameters.delay || 1000;
        
        this.helpers.Log.info(`ExampleService executando #${this.counter}`, {
            message,
            delay,
            parameters
        });

        // Simular trabalho
        await new Promise(resolve => setTimeout(resolve, delay));

        // Exemplo de uso de models
        const eventCount = await this.models.Event.count();
        const ticketCount = await this.models.Ticket.count();
        
        this.helpers.Log.info('Estatísticas do sistema', {
            events: eventCount,
            tickets: ticketCount,
            execution: this.counter
        });

        return {
            success: true,
            execution: this.counter,
            message,
            stats: {
                events: eventCount,
                tickets: ticketCount
            }
        };
    }
}

module.exports = ExampleService; 