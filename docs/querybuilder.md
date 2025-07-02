# Manual do QueryBuilder

O QueryBuilder do framework FWE permite construir consultas SQL de forma encadeada, segura e padronizada, facilitando o acesso ao banco de dados sem escrever SQL manualmente na maior parte dos casos.

---

## Como Usar

O QueryBuilder está disponível nos models que herdam de `BaseModel`. Os métodos estáticos permitem montar consultas de forma fluida.

### Exemplo Básico
```js
const User = require('../Models/User');

// Buscar todos os usuários ativos, ordenados por nome
const users = await User.select(['id', 'name', 'email'])
    .where({ active: 1 })
    .orderBy('name', 'ASC')
    .get();
```

### Buscar um registro específico
```js
const user = await User.find(1); // Busca pelo id
```

### Buscar com múltiplas condições
```js
const events = await Event.where({ active: 1, created_by: 2 })
    .orderBy('startdate', 'DESC')
    .limit(10)
    .get();
```

### Contar registros
```js
const total = await User.count();
```

---

## Métodos Disponíveis

- `.select(campos)` — Define os campos a serem retornados
- `.where(condicoes)` — Adiciona condições (objeto ou chave/valor)
- `.orderBy(campo, direcao)` — Ordena o resultado
- `.limit(qtd, offset)` — Limita a quantidade de resultados
- `.get()` — Executa a consulta e retorna um array
- `.first()` — Retorna o primeiro resultado
- `.find(id)` — Busca por id
- `.count()` — Conta registros
- `.insert(dados)` — Insere registro (use preferencialmente via métodos do model)
- `.update(id, dados)` — Atualiza registro
- `.delete(id)` — Remove registro

---

## Boas Práticas

- Sempre use os métodos do model para acesso ao banco, evitando SQL manual.
- Prefira `.where({ campo: valor })` para evitar SQL Injection.
- Use `.allowedFields` no model para restringir campos que podem ser gravados.
- Utilize migrations para criar/alterar tabelas, nunca SQL direto no código.
- Use `.get()` para listas e `.first()` para um único registro.

---

## Como NÃO Usar

- **Evite concatenar SQL manualmente:**
  ```js
  // ERRADO!
  const sql = `SELECT * FROM users WHERE email = '${email}'`;
  await User.db.query(sql);
  ```
- **Não use SQL direto em controllers:**
  ```js
  // ERRADO!
  const result = await User.db.query('DELETE FROM users WHERE id = ?', [id]);
  ```
- **Não altere a estrutura do banco via código:**
  - Use sempre migrations para criar/alterar tabelas.

---

## Exemplo Avançado

```js
// Buscar eventos ativos de um usuário, entre datas
const events = await Event.where({ active: 1, created_by: userId })
    .where('startdate', '>=', '2024-01-01')
    .where('enddate', '<=', '2024-12-31')
    .orderBy('startdate', 'ASC')
    .get();
```

---

## Dicas

- Consulte sempre o model correspondente para saber os campos disponíveis.
- Use os métodos estáticos para manter o código limpo e seguro.
- Para consultas muito complexas, crie métodos customizados no model.
- Prefira sempre o uso do QueryBuilder ao invés de SQL manual.

---

Mantenha o padrão e garanta segurança e manutenibilidade no acesso ao banco de dados! 