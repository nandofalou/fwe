# Sistema de Flash Messages (flashdata)

O sistema de flashdata permite exibir mensagens temporárias para o usuário, que aparecem apenas na próxima requisição e desaparecem automaticamente. É inspirado no conceito de flash messages do CodeIgniter e frameworks modernos.

---

## Conceito
- **Flash message** é uma mensagem temporária, geralmente usada para feedback de ações (sucesso, erro, aviso, info).
- A mensagem é salva na sessão e removida automaticamente após ser lida.
- Útil para redirecionamentos: exibir mensagem após login, logout, erro de validação, etc.

---

## Funcionamento Interno
- As mensagens são salvas no campo `data` da sessão, com prefixo `flash_`.
- O helper `Flash` centraliza toda a manipulação de flashdata.
- Métodos principais:
  - `set(sessionId, key, message, type)` — define uma mensagem flash
  - `get(sessionId, key)` — obtém e remove a mensagem
  - `peek(sessionId, key)` — obtém sem remover
  - `getAll(sessionId)` — obtém e remove todas
  - `clear(sessionId)` — remove todas

---

## Métodos do Helper Flash

```js
// Definir mensagem flash
await Flash.set(sessionId, 'login', 'Bem-vindo!', 'success');
await Flash.setError(sessionId, 'login', 'Credenciais inválidas');
await Flash.setSuccess(sessionId, 'logout', 'Logout realizado com sucesso!');

// Obter e remover (exibir uma vez)
const msg = await Flash.get(sessionId, 'login');
if (msg) {
  // msg = { message: 'Bem-vindo!', type: 'success', timestamp: ... }
}

// Obter todas as mensagens (exemplo para views)
const flashes = await Flash.getAll(sessionId);
// flashes = { login: { message, type, ... }, logout: { ... } }

// Obter sem remover (peek)
const info = await Flash.peek(sessionId, 'login');

// Remover manualmente
await Flash.remove(sessionId, 'login');
// Limpar todas
await Flash.clear(sessionId);
```

---

## Uso em Controllers

```js
// Após login bem-sucedido
await BaseController.flashSuccess(req, 'login', `Bem-vindo, ${user.name}!`);
return res.redirect('/dashboard');

// Após erro de login
await BaseController.flashError(req, 'login', 'Credenciais inválidas');
return res.redirect('/auth');
```

---

## Uso em Views (EJS)

No BaseController, as mensagens flash já são injetadas automaticamente nas views:

```ejs
<% if (flash && flash.login) { %>
  <div class="flash <%= flash.login.type %>"><%= flash.login.message %></div>
<% } %>
```

Para múltiplas mensagens:
```ejs
<% Object.keys(flash).forEach(function(key) { %>
  <div class="flash <%= flash[key].type %>"><%= flash[key].message %></div>
<% }) %>
```

---

## Dicas e Boas Práticas
- Use chaves descritivas para cada contexto (`login`, `logout`, `update`, etc).
- Sempre use os métodos do BaseController para manipular flash e sessão.
- O flash desaparece automaticamente após ser exibido.
- O CSS e JS de flash já estão prontos em `Public/css/flash.css` e `Public/js/flash.js`.

---

## Exemplo Completo

```js
// Controller
await BaseController.flashSuccess(req, 'update', 'Dados salvos com sucesso!');
return res.redirect('/perfil');

// View (EJS)
<% if (flash && flash.update) { %>
  <div class="flash <%= flash.update.type %>"><%= flash.update.message %></div>
<% } %>
``` 