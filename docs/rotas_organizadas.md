# Organização de Rotas

O sistema de rotas foi reorganizado para melhor manutenibilidade e organização do código.

---

## Estrutura de Arquivos

```
App/Config/Routes/
├── Routes.js          # Arquivo principal (orquestrador)
├── RoutesWeb.js       # Rotas das páginas web
├── RoutesApi.js       # Rotas da API
└── BaseRoutes.js      # Classe base do router
```

---

## Routes.js (Arquivo Principal)

O arquivo principal agora é muito mais limpo e apenas orquestra os outros arquivos:

```javascript
const BaseRoutes = require('./BaseRoutes');
const registerWebRoutes = require('./RoutesWeb');
const registerApiRoutes = require('./RoutesApi');

class Routes extends BaseRoutes {
    constructor() {
        super();
        this.registerRoutes();
    }

    registerRoutes() {
        // Registra rotas web (páginas)
        registerWebRoutes(this);
        
        // Registra rotas da API
        registerApiRoutes(this);
    }
}
```

---

## RoutesWeb.js (Rotas Web)

Contém todas as rotas relacionadas às páginas web:

- **Rotas públicas**: `/`, `/example`, `/install`, `/dashboard`
- **Rotas de documentação**: `/docs`, `/docs/:documento`
- **Rotas de autenticação**: `/auth/*`
- **Rotas de eventos**: `/event/*` (com SessionMiddleware)
- **Rotas de categorias**: `/category/*` (com SessionMiddleware)

### Exemplo de uso:

```javascript
function registerWebRoutes(router) {
    // Rota inicial
    router.get('/', HomeController.index);
    
    // Grupos de rotas
    router.group('/auth', [], authRouter => {
        authRouter.get('/', AuthController.index);
        authRouter.post('/', AuthController.login);
        authRouter.get('/logout', AuthController.logout);
    });
}
```

---

## RoutesApi.js (Rotas da API)

Contém todas as rotas da API, separadas em públicas e protegidas:

### Rotas Públicas da API:
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/forgot-password`
- etc.

### Rotas Protegidas da API:
- `/api/users/*` (com AuthMiddleware)
- `/api/events/*` (com AuthMiddleware)
- `/api/categories/*` (com AuthMiddleware)

### Exemplo de uso:

```javascript
function registerApiRoutes(router) {
    // Rotas públicas da API
    router.group('/api', [], publicApiRouter => {
        publicApiRouter.post('/auth/login', AuthApiController.login);
        // ...
    });

    // Rotas protegidas da API
    router.group('/api', [AuthMiddleware.handle], protectedApiRouter => {
        protectedApiRouter.resource('/users', UserController);
        protectedApiRouter.resource('/events', EventController);
        // ...
    });
}
```

---

## Vantagens da Nova Organização

### ✅ **Separação de Responsabilidades**
- Rotas web separadas das rotas da API
- Cada arquivo tem uma responsabilidade específica

### ✅ **Manutenibilidade**
- Fácil de encontrar e modificar rotas específicas
- Código mais limpo e organizado

### ✅ **Escalabilidade**
- Fácil adicionar novas rotas sem poluir o arquivo principal
- Estrutura preparada para crescimento

### ✅ **Legibilidade**
- Arquivo principal muito mais limpo
- Fácil entender a estrutura geral

---

## Como Adicionar Novas Rotas

### Para rotas web:
1. Abra `RoutesWeb.js`
2. Adicione suas rotas no local apropriado
3. Use `router.group()` para organizar por funcionalidade

### Para rotas da API:
1. Abra `RoutesApi.js`
2. Adicione nas rotas públicas ou protegidas conforme necessário
3. Use `router.resource()` para CRUDs completos

### Exemplo de adição:

```javascript
// Em RoutesWeb.js
router.group('/novo-recurso', [SessionMiddleware], novoRouter => {
    novoRouter.get('/', NovoController.index);
    novoRouter.get('/edit', NovoController.edit);
    novoRouter.post('/', NovoController.store);
});

// Em RoutesApi.js
protectedApiRouter.resource('/novo-recurso', NovoApiController);
```

---

## Estrutura Final

```
Routes.js (orquestrador)
├── RoutesWeb.js (páginas)
│   ├── Rotas públicas
│   ├── Rotas de auth
│   ├── Rotas de eventos
│   └── Rotas de categorias
└── RoutesApi.js (API)
    ├── Rotas públicas da API
    └── Rotas protegidas da API
```

Esta organização torna o código muito mais limpo, organizado e fácil de manter! 🚀 