# Recursos API

## 1. Criar o Model

- Crie um arquivo em `App/Models/NomeDoRecurso.js`.
- O model deve herdar de `BaseModel` e definir:
  - Nome da tabela (`this.table`)
  - Chave primária (`this.primaryKey`)
  - Campos permitidos (`this.allowedFields`)
  - Se usa soft delete (`this.softDelete`)

**Exemplo: `App/Models/Service.js`**
```js
const BaseModel = require('./BaseModel');

class Service extends BaseModel {
    constructor() {
        super();
        this.table = 'services';
        this.primaryKey = 'id';
        this.softDelete = false;
        this.allowedFields = [
            'name', 'status', 'started_at', 'stopped_at', 'memory_usage', 'cpu_usage',
            'created_at', 'updated_at'
        ];
    }
}

module.exports = Service;
```

---

## 2. Criar o Validator (opcional, mas recomendado)

- Crie um arquivo em `App/Validations/NomeDoRecursoValidator.js`.
- Use o helper `Validator` e defina métodos estáticos para cada operação (create, update, id, etc).
- As regras são strings separadas por pipe (`|`).

**Exemplo: `App/Validations/ServiceValidator.js`**
```js
const Validator = require('../Helpers/Validator');

class ServiceValidator {
    static validateCreate(data) {
        const rules = {
            name: 'required|string|max:100',
            status: 'required|in:running,stopped,error',
            memory_usage: 'optional|numeric',
            cpu_usage: 'optional|numeric'
        };
        return Validator.validate(data, rules);
    }
    // ... outros métodos (validateUpdate, validateId)
}

module.exports = ServiceValidator;
```

---

## 3. Criar o Controller

- Crie um arquivo em `App/Controllers/NomeDoRecursoController.js`.
- Importe o model, o validator e o helper de resposta.
- Implemente os métodos `index`, `show`, `store`, `update`, `destroy`.
- Sempre valide os dados antes de criar/atualizar.

**Exemplo: `App/Controllers/ServiceController.js`**
```js
const Service = require('../Models/Service');
const ServiceValidator = require('../Validations/ServiceValidator');
const Response = require('../Helpers/Response');

const ServiceController = {
    async index(req, res) {
        try {
            const services = await Service.get();
            return res.json(Response.success(services));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao listar serviços.', null));
        }
    },
    async show(req, res) {
        const validation = ServiceValidator.validateId(req.params.id);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('ID inválido', validation.errors));
        }
        // ...
    },
    // store, update, destroy...
};

module.exports = ServiceController;
```

---

## 4. Criar a Migration

- Crie um arquivo SQL em `App/Migrations/Mysql/` (para MySQL) ou `App/Migrations/Sqlite/` (para SQLite).
- Use prefixo numérico crescente (ex: `006_create_novo_recurso_table.sql`).
- Siga o padrão dos exemplos existentes.
- O sistema executa automaticamente as migrations da pasta correta conforme o banco configurado no `config.ini`.

**Exemplo MySQL:**
```sql
CREATE TABLE IF NOT EXISTS services (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  status ENUM('running', 'stopped', 'error') DEFAULT 'stopped',
  started_at DATETIME NULL,
  stopped_at DATETIME NULL,
  memory_usage BIGINT NULL,
  cpu_usage DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Exemplo SQLite:**
```sql
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  status TEXT DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error')),
  started_at DATETIME NULL,
  stopped_at DATETIME NULL,
  memory_usage INTEGER NULL,
  cpu_usage REAL NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Adicionar no Router

- Importe o controller no arquivo `App/config/Routes/Routes.js`.
- Adicione a linha:
  ```js
  router.resource('/nomedarecurso', NomeDoRecursoController);
  ```
- Se necessário, adicione rotas customizadas (ex: busca por campo).

**Exemplo:**
```js
const ServiceController = require('../../Controllers/ServiceController');
// ...
router.resource('/services', ServiceController);
```

---

## 6. Checklist Final

- [ ] Model criado em `App/Models/`
- [ ] Validator criado em `App/Validations/` (opcional, mas recomendado)
- [ ] Controller criado em `App/Controllers/`
- [ ] Migration criada em `App/Migrations/` (e subpastas)
- [ ] Controller adicionado no router

---

**Dica:**  
Sempre siga o padrão dos arquivos já existentes para manter a consistência do projeto! 