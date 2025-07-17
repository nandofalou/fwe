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
- `.like(campo, valor, posicao)` — Adiciona condição LIKE (posicao: 'before', 'after', 'both' - padrão 'both')
- `.whereIn(campo, array)` — Adiciona condição IN
- `.notIn(campo, array)` — Adiciona condição NOT IN
- `.not(campo, valor)` — Adiciona condição !=
- `.isNull(campo)` — Adiciona condição IS NULL
- `.isNotNull(campo)` — Adiciona condição IS NOT NULL
- `.countQuery(idxcount, perPage)` — Conta o total de registros (ou distintos) e retorna dados de paginação

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

## Novos Métodos Avançados

### LIKE
```js
// LIKE padrão (both)
const users = await User.like('title', 'match').get(); // WHERE title LIKE '%match%'

// LIKE before
const users = await User.like('title', 'match', 'before').get(); // WHERE title LIKE '%match'

// LIKE after
const users = await User.like('title', 'match', 'after').get(); // WHERE title LIKE 'match%'

// LIKE both (explícito)
const users = await User.like('title', 'match', 'both').get(); // WHERE title LIKE '%match%'

// LIKE múltiplos campos
const users = await User.like({ title: 'match', page1: 'match', page2: 'match' }).get();
// WHERE title LIKE '%match%' AND page1 LIKE '%match%' AND page2 LIKE '%match%'
```

### IN
```js
// Buscar eventos com ids específicos
const events = await Event.whereIn('id', [1,2,3]).get();
```

### NOT IN
```js
// Buscar categorias exceto as de id 5, 6 e 7
const categories = await Category.notIn('id', [5,6,7]).get();
```

### NOT
```js
// Buscar usuários que não estão inativos
const users = await User.not('active', 0).get();
``` 

### IS NULL
```js
// Buscar usuários sem email cadastrado
const users = await User.isNull('email').get();
```

### IS NOT NULL
```js
// Buscar eventos que possuem data de início definida
const events = await Event.isNotNull('startdate').get();
``` 

### countQuery

O método `countQuery` retorna o total de registros (ou distintos) da consulta atual, útil para paginação avançada, especialmente em DataTables ou APIs.

**Parâmetros:**
- `idxcount` (string, opcional): campo a ser contado de forma distinta (ex: 'ticket.id'). Se não informado, conta a chave primária.
- `perPage` (int, opcional): quantidade de registros por página (padrão: 10).

**Retorno:**
Um objeto com:
- `pages`: total de páginas
- `rows`: total de registros
- `perPage`: quantidade por página

**Exemplo de uso:**
```js
const count = await Ticket.countQuery('ticket.id', 20);
// count = { pages: 5, rows: 100, perPage: 20 }

// Uso típico em paginação:
const builder = Ticket.dataTableQuery();
const count = await builder.countQuery('ticket.id', perPage);
const tickets = await builder.get();
```

**Dica:**
Use este método para obter dados de paginação antes de buscar os registros com `.get()`, especialmente em APIs e DataTables. 