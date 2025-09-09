# Serviços de Desenvolvimento

## Visão Geral

O sistema de serviços do FWE Framework suporta a criação de serviços de desenvolvimento que não são carregados automaticamente pelo `ServiceManager`. Isso permite desenvolver e testar novos serviços sem afetar o ambiente de produção.

## Como Funciona

Serviços que começam com `_` (underscore) ou `.` (ponto) são automaticamente ignorados pelo `ServiceManager` e não aparecem na interface de gerenciamento de serviços.

### Convenções de Nomenclatura

- **`_NomeDoServico.js`** - Serviço de desenvolvimento (underscore)
- **`.NomeDoServico.js`** - Serviço oculto (ponto)

### Exemplos

```javascript
// Este serviço NÃO será carregado
_DevelopmentService.js
_TestService.js
_BackupService.js

// Este serviço NÃO será carregado
.HiddenService.js
.ConfigService.js
.DebugService.js

// Este serviço SERÁ carregado normalmente
ExampleService.js
IhxSocketServer.js
TicketGeneratorService.js
```

## Casos de Uso

### 1. Desenvolvimento de Novos Serviços
```javascript
// _NovoService.js
const BaseService = require('./BaseService');

class NovoService extends BaseService {
    constructor() {
        super();
        this.name = '_NovoService';
        this.description = 'Serviço em desenvolvimento';
        
        this.config = {
            autoStart: false,
            interval: 60000,
            maxRetries: 3
        };
    }

    async execute() {
        // Lógica do serviço em desenvolvimento
        this.log.info('Testando novo serviço...');
        return { success: true };
    }
}

module.exports = NovoService;
```

### 2. Serviços de Teste
```javascript
// _TestService.js
const BaseService = require('./BaseService');

class TestService extends BaseService {
    constructor() {
        super();
        this.name = '_TestService';
        this.description = 'Serviço para testes';
        
        this.config = {
            autoStart: false,
            interval: 30000,
            maxRetries: 1
        };
    }

    async execute() {
        // Testes específicos
        this.log.info('Executando testes...');
        return { success: true };
    }
}

module.exports = TestService;
```

### 3. Serviços de Configuração Temporária
```javascript
// .ConfigService.js
const BaseService = require('./BaseService');

class ConfigService extends BaseService {
    constructor() {
        super();
        this.name = '.ConfigService';
        this.description = 'Serviço de configuração temporária';
        
        this.config = {
            autoStart: false,
            interval: 0, // Execução única
            maxRetries: 0
        };
    }

    async execute() {
        // Configurações temporárias
        this.log.info('Aplicando configurações...');
        return { success: true };
    }
}

module.exports = ConfigService;
```

## Vantagens

1. **Desenvolvimento Seguro**: Pode desenvolver novos serviços sem afetar o sistema em produção
2. **Testes Isolados**: Teste serviços específicos sem interferência
3. **Organização**: Mantenha serviços de desenvolvimento separados dos de produção
4. **Flexibilidade**: Fácil ativação/desativação de serviços de desenvolvimento

## Como Ativar um Serviço de Desenvolvimento

Para ativar um serviço de desenvolvimento, simplesmente renomeie o arquivo removendo o prefixo:

```bash
# De:
_DevelopmentService.js

# Para:
DevelopmentService.js
```

## Logs

Serviços de desenvolvimento que são ignorados geram logs informativos:

```
[INFO] Serviço ignorado (desenvolvimento): _DevelopmentService
[INFO] Serviço ignorado (desenvolvimento): .HiddenService
```

## Considerações

- Serviços de desenvolvimento não aparecem na interface web
- Não são carregados pelo `ServiceManager`
- Não consomem recursos do sistema
- Podem ser facilmente ativados renomeando o arquivo
- Útil para desenvolvimento, testes e configurações temporárias

## Exemplo Prático

1. Crie um novo serviço com prefixo `_` ou `.`
2. Desenvolva e teste o serviço
3. Quando estiver pronto, renomeie removendo o prefixo
4. O serviço será automaticamente carregado na próxima inicialização

```bash
# Durante desenvolvimento
_MeuNovoServico.js

# Quando pronto para produção
MeuNovoServico.js
```
