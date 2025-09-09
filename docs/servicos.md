# Sistema de Controle de Processos/Jobs

O sistema de serviços do framework FWE permite executar rotinas independentes com controle completo sobre seu ciclo de vida, monitoramento de recursos e integração com o framework existente.

---

## Visão Geral

O sistema de serviços oferece:

- **Controle Granular**: Cada serviço pode ser controlado independentemente
- **Monitoramento**: Acompanhamento de recursos em tempo real (CPU, memória)
- **Flexibilidade**: Parâmetros via querystring ou JSON
- **Integração**: Uso completo do framework existente (Models, Helpers, etc.)
- **Interface Web**: Controle via web sem necessidade de CLI
- **Robustez**: Tratamento de erros e recuperação automática

---

## Estrutura do Sistema

### 1. Pasta de Serviços (`App/Services/`)

```
App/Services/
├── BaseService.js              # Classe base para todos os serviços
├── ServiceManager.js           # Gerenciador central de serviços
├── ExampleService.js           # Exemplo de serviço básico
├── TicketGeneratorService.js   # Serviço de geração automática de tickets
└── ...                         # Outros serviços
```

### 2. Modelo de Dados (`App/Models/Service.js`)

Gerencia os registros de execução dos serviços no banco de dados.

### 3. Controller (`App/Controllers/ServicesController.js`)

Controla as operações via web interface.

---

## Criando um Serviço

### Estrutura Básica

```javascript
// App/Services/MeuServico.js
const BaseService = require('./BaseService');

class MeuServico extends BaseService {
    constructor() {
        super('MeuServico', {
            autoStart: false,        // Iniciar automaticamente?
            interval: 60000,         // Intervalo em ms (1 minuto)
            maxRetries: 3,           // Máximo de tentativas em caso de erro
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            maxCpuUsage: 80          // 80%
        });
    }

    /**
     * Executado quando o serviço inicia
     */
    async onStart(parameters) {
        // Lógica de inicialização
    }

    /**
     * Executado quando o serviço para
     */
    async onStop() {
        // Lógica de finalização
    }

    /**
     * Lógica principal do serviço (OBRIGATÓRIO)
     */
    async run(parameters = {}) {
        // Sua lógica aqui
        return { success: true, data: 'resultado' };
    }
}

module.exports = MeuServico;
```

### Recursos Disponíveis

#### Helpers
```javascript
this.helpers.Event      // Sistema de eventos
this.helpers.Log        // Sistema de logs
this.helpers.Database   // Acesso ao banco
this.helpers.Date       // Manipulação de datas
this.helpers.String     // Utilitários de string
this.helpers.Validation // Validação de dados
```

#### Models
```javascript
this.models.Service     // Modelo de serviços
this.models.User        // Modelo de usuários
this.models.Permission  // Modelo de permissões
this.models.Session     // Modelo de sessões
```

---

## Exemplos de Serviços

### 1. Serviço de Exemplo

```javascript
// App/Services/ExampleService.js
const BaseService = require('./BaseService');

class ExampleService extends BaseService {
    constructor() {
        super('ExampleService', {
            autoStart: false,
            interval: 30000, // 30 segundos
            maxRetries: 3
        });
        
        this.counter = 0;
    }

    async onStart(parameters) {
        this.helpers.Log.info('ExampleService iniciado', { parameters });
        this.counter = 0;
    }

    async onStop() {
        this.helpers.Log.info('ExampleService parado', { 
            totalExecutions: this.counter 
        });
    }

    async run(parameters = {}) {
        this.counter++;
        
        const message = parameters.message || 'Execução padrão';
        const delay = parameters.delay || 1000;
        
        // Simular trabalho
        await new Promise(resolve => setTimeout(resolve, delay));

        // Exemplo de uso de models
        const userCount = await this.models.User.count();
        const serviceCount = await this.models.Service.count();
        
        return {
            success: true,
            execution: this.counter,
            message,
            stats: { users: userCount, services: serviceCount }
        };
    }
}

module.exports = ExampleService;
```

### 2. Serviço de Limpeza de Dados

```javascript
// App/Services/DataCleanupService.js
const BaseService = require('./BaseService');

class DataCleanupService extends BaseService {
    constructor() {
        super('DataCleanupService', {
            autoStart: false,
            interval: 86400000, // 24 horas
            maxRetries: 3
        });
        
        this.cleanedCount = 0;
    }

    async run(parameters = {}) {
        const {
            days_old = 30,
            table = 'services'
        } = parameters;

        // Lógica de limpeza de dados antigos
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days_old);
        
        // Limpar registros antigos
        const result = await this.models.Service
            .where('created_at', '<', cutoffDate.toISOString())
            .delete();
        
        this.cleanedCount += result;
        
        return {
            success: true,
            cleaned: result,
            total_cleaned: this.cleanedCount
        };
    }
}

module.exports = DataCleanupService;
```

---

## Controle via Web Interface

### Rotas Disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/services` | Lista todos os serviços |
| GET | `/services/list` | Lista serviços (AJAX) |
| GET | `/services/status` | Status dos serviços (AJAX) |
| GET | `/services/info/:serviceName` | Informações de um serviço |
| GET | `/services/run/:serviceName` | Inicia um serviço |
| GET | `/services/stop/:serviceName` | Para um serviço |
| GET | `/services/stop-id/:id` | Para um serviço por ID |
| GET | `/services/stop-all` | Para todos os serviços |
| GET | `/services/restart/:serviceName` | Reinicia um serviço |
| GET | `/services/cleanup` | Limpa registros antigos |

### Exemplos de Uso

#### Iniciar Serviço com Parâmetros
```
GET /services/run/ExampleService?message=Teste&delay=2000
```

#### Iniciar Serviço de Limpeza de Dados
```
GET /services/run/DataCleanupService?days_old=30&table=services
```

#### Verificar Status
```
GET /services/status
```

#### Parar Serviço
```
GET /services/stop/ExampleService
```

---

## Monitoramento e Métricas

### Métricas Coletadas

- **Uso de Memória**: `process.memoryUsage().heapUsed`
- **Uso de CPU**: `process.cpuUsage()`
- **Tempo de Execução**: Duração de cada execução
- **Número de Execuções**: Contador de execuções
- **Taxa de Erro**: Percentual de execuções com erro
- **Tempo Ativo**: Tempo total de execução

### Eventos Emitidos

```javascript
// Eventos disponíveis
'service:started'      // Serviço iniciado
'service:stopped'      // Serviço parado
'service:error'        // Erro no serviço
'service:completed'    // Execução concluída
'service:memory_high'  // Uso de memória alto
'service:cpu_high'     // Uso de CPU alto
'service:paused'       // Serviço pausado
'service:resumed'      // Serviço resumido
```

### Exemplo de Listener de Eventos

```javascript
const Event = require('../Helpers/Event');

Event.on('service:started', (data) => {
    console.log('Serviço iniciado:', data.name);
});

Event.on('service:error', (data) => {
    console.error('Erro no serviço:', data.name, data.error);
});
```

---

## Configuração Avançada

### Configurações do Serviço

```javascript
{
    autoStart: false,                    // Iniciar automaticamente
    interval: 60000,                     // Intervalo em ms
    maxRetries: 3,                       // Máximo de tentativas
    maxMemoryUsage: 100 * 1024 * 1024,  // Limite de memória
    maxCpuUsage: 80,                     // Limite de CPU (%)
    // Outras configurações customizadas
}
```

### Tratamento de Erros

O sistema automaticamente:

1. **Conta erros**: Incrementa contador de erros
2. **Emite eventos**: Notifica sobre erros
3. **Atualiza status**: Marca serviço como erro no banco
4. **Para serviço**: Se exceder `maxRetries`
5. **Logs detalhados**: Registra stack trace completo

### Recuperação Automática

```javascript
// O serviço pode implementar recuperação customizada
async handleError(error) {
    // Lógica de recuperação específica
    if (error.code === 'DATABASE_CONNECTION') {
        await this.helpers.Database.connect();
    }
    
    // Chamar método padrão
    await super.handleError(error);
}
```

---

## Integração com o Framework

### Uso de Models

```javascript
async run(parameters) {
    // Buscar dados
    const users = await this.models.User.where({ active: 1 }).get();
    
    // Inserir dados
    await this.models.Service.insert({
        name: 'Novo Serviço',
        status: 'stopped',
        created_at: new Date().toISOString()
    });
    
    // Atualizar dados
    await this.models.User.update(1, { active: 0 });
    
    // Contar registros
    const count = await this.models.Service.count();
}
```

### Uso de Helpers

```javascript
async run(parameters) {
    // Logging
    this.helpers.Log.info('Executando serviço', { parameters });
    
    // Validação
    const validation = this.helpers.Validation.validate(parameters, {
        user_id: 'required|numeric',
        days_old: 'numeric|min:1'
    });
    
    // Formatação de data
    const now = this.helpers.Date.format(new Date(), 'Y-m-d H:i:s');
    
    // Manipulação de string
    const code = this.helpers.String.random(8);
}
```

### Uso de Database Helper

```javascript
async run(parameters) {
    // Queries customizadas
    const result = await this.helpers.Database.query(
        'SELECT COUNT(*) as total FROM services WHERE status = ?',
        [parameters.status]
    );
    
    // Transações
    await this.helpers.Database.transaction(async () => {
        await this.models.Service.insert(data1);
        await this.models.Service.insert(data2);
    });
}
```

---

## Boas Práticas

### 1. Tratamento de Erros

```javascript
async run(parameters) {
    try {
        // Sua lógica aqui
        return { success: true, data: result };
    } catch (error) {
        // Log detalhado
        this.helpers.Log.error('Erro no serviço', { 
            error: error.message,
            stack: error.stack,
            parameters 
        });
        
        // Re-throw para tratamento automático
        throw error;
    }
}
```

### 2. Validação de Parâmetros

```javascript
async run(parameters = {}) {
    // Validar parâmetros obrigatórios
    if (!parameters.user_id) {
        throw new Error('user_id é obrigatório');
    }
    
    // Validar tipos
    if (typeof parameters.days_old !== 'number' || parameters.days_old <= 0) {
        throw new Error('days_old deve ser um número positivo');
    }
    
    // Sua lógica aqui
}
```

### 3. Monitoramento de Recursos

```javascript
async run(parameters) {
    // Verificar uso de memória
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 50 * 1024 * 1024) { // 50MB
        this.helpers.Log.warn('Uso de memória alto');
    }
    
    // Sua lógica aqui
}
```

### 4. Logs Estruturados

```javascript
async run(parameters) {
    this.helpers.Log.info('Iniciando processamento', {
        service: this.name,
        parameters,
        timestamp: new Date().toISOString()
    });
    
    // Sua lógica aqui
    
    this.helpers.Log.info('Processamento concluído', {
        service: this.name,
        result: 'sucesso',
        duration: Date.now() - startTime
    });
}
```

---

## Troubleshooting

### Problemas Comuns

#### 1. Serviço não inicia
- Verificar se a classe estende `BaseService`
- Verificar se o método `run()` está implementado
- Verificar logs de erro

#### 2. Erro de memória
- Ajustar `maxMemoryUsage` no construtor
- Implementar limpeza de dados no `onStop()`
- Verificar vazamentos de memória

#### 3. Serviço para com erro
- Verificar `maxRetries` no construtor
- Implementar tratamento de erro customizado
- Verificar dependências (banco, arquivos, etc.)

#### 4. Parâmetros não chegam
- Verificar formato da querystring
- Usar `JSON.parse()` se necessário
- Validar parâmetros no início do `run()`

### Debug

```javascript
// Ativar logs detalhados
this.helpers.Log.debug('Debug info', { 
    service: this.name,
    status: this.status,
    metrics: this.metrics 
});

// Verificar configurações
console.log('Configurações:', this.config);

// Verificar status
console.log('Status:', this.getInfo());
```

---

## Conclusão

O sistema de serviços do FWE oferece uma solução robusta e flexível para execução de rotinas independentes, com controle completo via interface web e integração total com o framework existente.

Para mais informações, consulte os exemplos na pasta `App/Services/` e a documentação do framework. 