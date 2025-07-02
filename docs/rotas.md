# Manual de Rotas

O sistema de rotas do framework FWE é inspirado no CodeIgniter 4 e Express, permitindo definir rotas RESTful e customizadas de forma simples e padronizada.

---

## Definindo Rotas

As rotas são definidas no arquivo `App/config/Routes/Routes.js`, utilizando o resource router e métodos auxiliares.

### Exemplo Básico de Resource
```js
const EventController = require('../../Controllers/EventController');

// Adiciona todas as rotas RESTful para /events
router.resource('/events', EventController);
```

O resource cria automaticamente as rotas:
- `GET    /events`        → `EventController.index`
- `GET    /events/:id`    → `EventController.show`
- `POST   /events`        → `EventController.store`
- `PUT    /events/:id`    → `EventController.update`
- `DELETE /events/:id`    → `EventController.destroy`

---

## Exemplo de Controller para Resource
```js
const EventController = {
    async index(req, res) { /* ... */ },
    async show(req, res) { /* ... */ },
    async store(req, res) { /* ... */ },
    async update(req, res) { /* ... */ },
    async destroy(req, res) { /* ... */ }
};
```

Cada método recebe `(req, res)` como parâmetros, igual ao padrão Express.

---

## Rotas Customizadas

Você pode adicionar rotas customizadas para ações específicas:

```js
router.get('/events/active', EventController.listActive);
router.post('/events/:id/publish', EventController.publish);
```

No controller, basta criar o método correspondente:
```js
async listActive(req, res) { /* ... */ }
async publish(req, res) { /* ... */ }
```

---

## Rotas com Middlewares

Para proteger rotas, adicione middlewares:
```js
const AuthMiddleware = require('../../Middlewares/AuthMiddleware');

this.group('/api', [AuthMiddleware.handle], router => {
    router.resource('/events', EventController);
});
```

---

## Exemplos Práticos

### Listar todos os eventos
```
GET /api/events
```

### Buscar evento por ID
```
GET /api/events/1
```

### Criar novo evento
```
POST /api/events
Body: { "name": "Show", "startdate": "2024-10-10", ... }
```

### Atualizar evento
```
PUT /api/events/1
Body: { "name": "Show Atualizado" }
```

### Deletar evento
```
DELETE /api/events/1
```

### Rota customizada
```
GET /api/events/active
```

---

## Como o Controller Deve Ser Chamado

- O nome do método no controller deve corresponder ao método HTTP e à ação:
  - `index`   → listar todos
  - `show`    → buscar por id
  - `store`   → criar
  - `update`  → atualizar
  - `destroy` → deletar
- Para rotas customizadas, crie métodos com nomes claros e autoexplicativos.
- Sempre use `(req, res)` como parâmetros.

**Exemplo:**
```js
async index(req, res) {
    // Listar todos
}
async show(req, res) {
    // Buscar por id
}
async store(req, res) {
    // Criar
}
async update(req, res) {
    // Atualizar
}
async destroy(req, res) {
    // Deletar
}
```

---

## Dicas e Boas Práticas

- Use sempre o resource router para CRUDs padrão.
- Para ações específicas, prefira rotas customizadas.
- Nomeie os métodos do controller de forma clara e consistente.
- Use middlewares para autenticação e autorização.
- Documente as rotas principais para facilitar o uso da API.

---

Mantenha o padrão e consulte este manual sempre que for criar ou alterar rotas! 