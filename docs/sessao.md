# Sistema de Sessão Persistente

O framework FWE possui um sistema de sessão persistente, inspirado em frameworks modernos, que armazena os dados da sessão do usuário no banco de dados.

---

## Conceito
- Cada usuário autenticado recebe um ID de sessão único (cookie).
- Os dados da sessão são salvos no banco, na tabela `fwe_session`.
- A sessão é persistente: sobrevive a reinícios do servidor e pode ser compartilhada entre múltiplas instâncias.

---

## Funcionamento Interno
- O helper `Session` centraliza toda a manipulação de sessão.
- O middleware de sessão garante que toda requisição tenha um `sessionId` válido.
- O campo `data` da tabela armazena um objeto JSON com todos os dados da sessão (usuário, flash, etc).

---

## Métodos do Helper Session

```js
// Criar nova sessão
await Session.create({ user_id, ip_address, user_agent, data, ttl });

// Obter sessão
await Session.get(sessionId);

// Atualizar dados
await Session.update(sessionId, { chave: valor });

// Definir valor específico
await Session.setValue(sessionId, 'user', userObj);

// Obter valor específico
const user = await Session.getValue(sessionId, 'user');

// Remover valor específico
await Session.removeValue(sessionId, 'user');

// Destruir sessão
await Session.destroy(sessionId);
```

---

## Integração com FlashData
- O sistema de flashData utiliza o campo `data` da sessão para armazenar mensagens temporárias.
- O helper `Flash` manipula chaves com prefixo `flash_` dentro da sessão.
- Ao exibir uma mensagem flash, ela é removida automaticamente do campo `data`.

---

## Uso em Controllers

```js
// Salvar usuário autenticado na sessão
await BaseController.setSessionData(req, 'user', userObj);

// Obter usuário da sessão
const user = await BaseController.getSessionData(req, 'user');

// Remover valor
await BaseController.removeSessionData(req, 'user');
```

---

## Dicas e Boas Práticas
- Sempre use os métodos utilitários do BaseController para manipular sessão e flash.
- Não manipule o objeto de sessão diretamente.
- O middleware de sessão já garante que toda requisição tenha um sessionId válido.
- O campo `data` pode armazenar qualquer objeto serializável em JSON.
- O sistema é compatível com múltiplos bancos (SQLite/MySQL).

---

## Exemplo Completo

```js
// Controller de login
const user = { id: 1, name: 'Admin', email: 'admin@admin.com' };
await BaseController.setSessionData(req, 'user', user);
await BaseController.flashSuccess(req, 'login', 'Bem-vindo!');
return res.redirect('/dashboard');

// Controller de logout
await BaseController.removeSessionData(req, 'user');
await BaseController.flashSuccess(req, 'logout', 'Logout realizado com sucesso!');
return res.redirect('/auth');
``` 