# Recursos API

## 1. Criar o Model

- Crie um arquivo em `App/Models/NomeDoRecurso.js`.
- O model deve herdar de `BaseModel` e definir:
  - Nome da tabela (`this.table`)
  - Chave primária (`this.primaryKey`)
  - Campos permitidos (`this.allowedFields`)
  - Se usa soft delete (`this.softDelete`)

**Exemplo: `App/Models/Event.js`**
```js
const BaseModel = require('./BaseModel');

class Event extends BaseModel {
    constructor() {
        super();
        this.table = 'event';
        this.primaryKey = 'id';
        this.softDelete = false;
        this.allowedFields = [
            'created_by', 'name', 'startdate', 'enddate', 'active', 'local',
            'created_at', 'updated_at', 'deleted_at'
        ];
    }
}

module.exports = Event;
```

---

## 2. Criar o Validator (opcional, mas recomendado)

- Crie um arquivo em `App/Validations/NomeDoRecursoValidator.js`.
- Use o helper `Validator` e defina métodos estáticos para cada operação (create, update, id, etc).
- As regras são strings separadas por pipe (`|`).

**Exemplo: `App/Validations/EventValidator.js`**
```js
const Validator = require('../Helpers/Validator');

class EventValidator {
    static validateCreate(data) {
        const rules = {
            name: 'required',
            startdate: 'required|date',
            enddate: 'required|date',
            active: 'required|numeric'
        };
        return Validator.validate(data, rules);
    }
    // ... outros métodos (validateUpdate, validateId)
}

module.exports = EventValidator;
```

---

## 3. Criar o Controller

- Crie um arquivo em `App/Controllers/NomeDoRecursoController.js`.
- Importe o model, o validator e o helper de resposta.
- Implemente os métodos `index`, `show`, `store`, `update`, `destroy`.
- Sempre valide os dados antes de criar/atualizar.

**Exemplo: `App/Controllers/EventController.js`**
```js
const Event = require('../Models/Event');
const EventValidator = require('../Validations/EventValidator');
const Response = require('../Helpers/Response');

const EventController = {
    async index(req, res) {
        try {
            const events = await Event.get();
            return res.json(Response.success(events));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao listar eventos.', null));
        }
    },
    async show(req, res) {
        const validation = EventValidator.validateId(req.params.id);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('ID inválido', validation.errors));
        }
        // ...
    },
    // store, update, destroy...
};

module.exports = EventController;
```

---

## 4. Criar a Migration

- Crie um arquivo SQL em `App/Migrations/Mysql/` (para MySQL) ou `App/Migrations/Sqlite/` (para SQLite).
- Use prefixo numérico crescente (ex: `006_create_novo_recurso_table.sql`).
- Siga o padrão dos exemplos existentes.
- O sistema executa automaticamente as migrations da pasta correta conforme o banco configurado no `config.ini`.

**Exemplo MySQL:**
```sql
CREATE TABLE IF NOT EXISTS event (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  -- campos...
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Exemplo SQLite:**
```sql
CREATE TABLE IF NOT EXISTS event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- campos...
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
const EventController = require('../../Controllers/EventController');
// ...
router.resource('/events', EventController);
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