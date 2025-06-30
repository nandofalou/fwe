# Sistema de Logging Centralizado

Este sistema de logging permite configurar como os logs são exibidos e salvos através do arquivo `config.ini`. O logging está centralizado no `BaseController`, então todos os controllers herdam automaticamente os métodos de logging.

## Configuração

No arquivo `config.ini`, adicione a seção `[logging]`:

```ini
[logging]
console = true
file = true
path = ./logs
```

### Opções de Configuração

- **`console`**: `true` ou `false` - Define se os logs devem aparecer no console
- **`file`**: `true` ou `false` - Define se os logs devem ser salvos em arquivos
- **`path`**: Caminho onde os arquivos de log serão salvos (padrão: `./logs`)

## Arquivos de Log

Quando `file = true`, o sistema cria automaticamente 3 arquivos:

- **`log.txt`** - Logs de informação (INFO)
- **`error.txt`** - Logs de erro (ERROR)
- **`warning.txt`** - Logs de aviso (WARNING)

## Como Usar

### Em Controllers (Recomendado)

Se seu controller herda de `BaseController`, você pode usar o logging diretamente:

```javascript
class UserController extends BaseController {
    static async login(req, res) {
        try {
            // ... lógica de login
            UserController.log.info('Login realizado com sucesso', { userId: user.id });
            return res.json({ success: true });
        } catch (error) {
            UserController.log.error('Erro no login', { error: error.message });
            return res.status(500).json({ error: true });
        }
    }
}
```

### Métodos Disponíveis

#### Log de Informação
```javascript
UserController.log.info('Mensagem de informação');
UserController.log.info('Mensagem com dados', { userId: 123, action: 'login' });
```

#### Log de Erro
```javascript
UserController.log.error('Mensagem de erro');
UserController.log.error('Erro com detalhes', { error: error.message, userId: 123 });
```

#### Log de Aviso
```javascript
UserController.log.warning('Mensagem de aviso');
UserController.log.warning('Aviso com contexto', { email: 'user@example.com' });
```

#### Log de Debug
```javascript
UserController.log.debug('Mensagem de debug');
UserController.log.debug('Debug com dados', { requestData: req.body });
```

### Em Outros Arquivos

Para arquivos que não herdam de `BaseController`, você pode importar diretamente:

```javascript
const Log = require('./App/Helpers/Log');

Log.info('Mensagem de informação');
Log.error('Mensagem de erro');
```

## Formato dos Logs

Os logs são formatados automaticamente com timestamp e nível:

```
[2024-01-15T10:30:45.123Z] [INFO] Login realizado com sucesso | Data: {"userId":123,"email":"user@example.com"}
[2024-01-15T10:30:46.456Z] [ERROR] Erro ao processar requisição | Data: {"error":"Database connection failed"}
```

## Exemplos de Uso

### Em Controllers (Herdando de BaseController)
```javascript
class UserController extends BaseController {
    static async login(req, res) {
        try {
            // ... lógica de login
            UserController.log.info('Login realizado com sucesso', { userId: user.id, email: user.email });
            return res.json({ success: true });
        } catch (error) {
            UserController.log.error('Erro no login', { email: req.body.email, error: error.message });
            return res.status(500).json({ error: true });
        }
    }

    static async create(req, res) {
        try {
            const user = await User.create(req.body);
            UserController.log.info('Novo usuário criado', { userId: user.id, email: user.email });
            return res.status(201).json({ data: user });
        } catch (error) {
            UserController.log.error('Erro ao criar usuário', { data: req.body, error: error.message });
            return res.status(500).json({ error: true });
        }
    }
}
```

### Em Middlewares
```javascript
app.use((err, req, res, next) => {
    // Importar diretamente para middlewares
    const Log = require('./App/Helpers/Log');
    
    Log.error('Erro interno do servidor', { 
        error: err.message, 
        url: req.url,
        method: req.method 
    });
    res.status(500).json({ error: true });
});
```

### Em Serviços
```javascript
const Log = require('./App/Helpers/Log');

async function processData(data) {
    try {
        Log.info('Iniciando processamento de dados', { dataSize: data.length });
        // ... processamento
        Log.info('Dados processados com sucesso');
    } catch (error) {
        Log.error('Erro no processamento', { error: error.message });
        throw error;
    }
}
```

## Logging Automático no BaseController

O `BaseController` já inclui logging automático para os métodos CRUD padrão:

- **`index()`** - Log de listagem
- **`show()`** - Log de consulta individual
- **`store()`** - Log de criação
- **`update()`** - Log de atualização
- **`destroy()`** - Log de exclusão

Cada método registra automaticamente:
- Operações bem-sucedidas com `info`
- Erros com `error`
- Registros não encontrados com `warning`

## Limpeza Automática

O sistema inclui um método para limpar logs antigos:

```javascript
// Limpar logs com mais de 30 dias
const Log = require('./App/Helpers/Log');
Log.cleanOldLogs(30);
```

## Vantagens

1. **Centralização**: Todos os logs em um só lugar
2. **Configurabilidade**: Controle via arquivo de configuração
3. **Flexibilidade**: Console e/ou arquivo
4. **Organização**: Logs separados por tipo
5. **Contexto**: Dados estruturados nos logs
6. **Timestamp**: Registro automático de data/hora
7. **Manutenção**: Limpeza automática de logs antigos
8. **Herança**: Controllers herdam automaticamente o logging
9. **Consistência**: Padrão uniforme em toda a aplicação

## Migração

Para migrar código existente, substitua:

```javascript
// Antes
console.log('Mensagem');
console.error('Erro:', error);

// Depois (em controllers)
UserController.log.info('Mensagem');
UserController.log.error('Erro', { error: error.message });

// Depois (em outros arquivos)
const Log = require('./App/Helpers/Log');
Log.info('Mensagem');
Log.error('Erro', { error: error.message });
``` 