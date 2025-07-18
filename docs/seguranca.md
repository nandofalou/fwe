# Helper Security

O helper `Security` centraliza funções de segurança do framework, como hash de senha, verificação, geração de tokens, criptografia e utilitários relacionados.

---

## Como usar

Importe o helper:
```js
const Security = require('../Helpers/Security');
```

---

## Principais métodos

### Hash de senha
```js
const hash = await Security.hashPassword('minhaSenha');
```

### Verificar senha
```js
const isValid = await Security.verifyPassword('minhaSenha', hash);
```

### Geração de hash genérico
```js
const hash = Security.hash('dados');
```

### Geração e verificação de tokens JWT
```js
const token = Security.generateToken(payload, secret, options);
const payload = Security.verifyToken(token, secret);
```

### Criptografia e descriptografia
```js
const encrypted = Security.encrypt('dados', 'chave');
const decrypted = Security.decrypt(encrypted, 'chave');
```

---

## Boas práticas
- Sempre use `Security.hashPassword` para salvar senhas de usuários.
- Nunca armazene senhas em texto puro.
- Use `verifyPassword` para autenticação.
- Use os métodos de token para autenticação JWT e fluxos de recuperação de senha.
- Consulte o código-fonte para métodos avançados (HMAC, CSRF, etc).

---

## Exemplo completo
```js
const Security = require('../Helpers/Security');

// Hash e verificação de senha
const senha = '123456';
const hash = await Security.hashPassword(senha);
const ok = await Security.verifyPassword('123456', hash); // true

// Geração de token
const token = Security.generateToken({ id: 1 }, 'segredo');
const payload = Security.verifyToken(token, 'segredo');
```

---

Consulte o arquivo `App/Helpers/Security.js` para todos os métodos disponíveis. 