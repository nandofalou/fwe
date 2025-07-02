# FWE - Framework Electron

Um framework inspirado no CodeIgniter 4 para aplicações desktop usando Electron.

## Características

- Backend em JavaScript com Electron
- Estrutura MVC inspirada no CodeIgniter 4
- Suporte a SQLite e MySQL/MariaDB
- Autenticação JWT
- API REST com documentação Swagger
- Interface desktop para gerenciamento do serviço
- Sistema de rotas similar ao CodeIgniter 4
- Helpers e bibliotecas padrão
- Validação de requisições
- CORS habilitado
- **Sistema de logging centralizado e configurável**

## Estrutura de Diretórios

```
fwe/
├── App/
│   ├── config/
│   ├── Controllers/
│   ├── Models/
│   ├── Libraries/
│   ├── Validations/
│   ├── Filters/
│   ├── Helpers/
│   └── Views/
├── Public/
└── main.js
```

## Requisitos

- Node.js 18+
- Electron 28+
- SQLite ou MySQL/MariaDB

## Instalação

1. Clone o repositório
2. Execute `npm install`
3. Execute `npm start` para iniciar em modo desenvolvimento

## Configuração

O sistema criará automaticamente um arquivo `config.ini` no diretório do usuário com as configurações padrão.

## Logging Centralizado

O sistema possui logging centralizado e configurável via `config.ini`:

```ini
[logging]
console = true
file = true
path = ./logs
```
- **console**: Exibe logs no console
- **file**: Salva logs em arquivos
- **path**: Caminho dos arquivos de log (padrão: ./logs)

Os logs são separados por tipo: `log.txt` (info), `error.txt` (erros), `warning.txt` (avisos).

### Exemplo de uso em controllers:
```js
UserController.log.info('Usuário autenticado', { userId: 1 });
UserController.log.error('Erro ao autenticar', { error: err.message });
```

### Exemplo de uso em helpers/serviços:
```js
const Log = require('./App/Helpers/Log');
Log.info('Processamento iniciado');
Log.error('Erro crítico', { error });
```

### Vantagens do sistema de log
- Centralização e padronização
- Configuração flexível
- Logs separados por tipo
- Limpeza automática de logs antigos
- Herança automática nos controllers

## Sistema de Validação

O framework possui um sistema de validação inspirado em frameworks modernos. As regras são declaradas em formato string:

```js
const rules = {
  name: 'required|string|max:200',
  email: 'required|email',
  age: 'numeric|optional|between:18,99'
};
const result = Validator.validate(data, rules);
if (!result.isValid) {
  // result.errors é um objeto com mensagens por campo
}
```

### Exemplo real de validator:
```js
// App/Validations/CategoryValidator.js
static validateCreate(data) {
    const rules = {
        name: 'required|string|max:200',
        code: 'numeric|optional',
        multiplo: 'numeric|optional|in:0,1',
        fluxo: 'numeric|optional',
        external_id: 'numeric|optional',
        type: 'string|optional|in:TICKET,CREDENCIADO,COLABORADOR'
    };
    return this.validate(data, rules);
}
```

### Regras suportadas
- required, optional, string, numeric, email, min, max, in, not_in, between, size, date, date_format, url, ip, json, regex, alpha, alpha_num, alpha_dash

### Exemplo de resposta de validação
```json
{
  "isValid": false,
  "errors": {
    "name": "Campo obrigatório",
    "email": "Email inválido"
  },
  "validated": {}
}
```

## Desenvolvimento

- Branch principal: `master`
- Branch de desenvolvimento: `develop`

## Licença

MIT 

# Configuração do Banco de Dados

Para usar MySQL, adicione no seu config.ini:

[database]
driver = mysql

[database.mysql]
host = localhost
user = seu_usuario
password = sua_senha
database = seu_banco
port = 3306 ; (opcional, padrão 3306)
charset = utf8mb4

O sistema detecta automaticamente se deve usar SQLite ou MySQL. 