# Exemplos de JOIN no FWE Framework

O FWE Framework agora suporta joins similares ao CodeIgniter 4. Aqui estão os exemplos de uso:

## Tipos de JOIN Disponíveis

### 1. INNER JOIN
```javascript
// Buscar tickets com informações do usuário
const tickets = await Ticket
    .select('tickets.*, users.name as user_name, users.email')
    .join('users', 'tickets.user_id = users.id')
    .where({ 'tickets.status': 'active' })
    .get();

// Buscar eventos com categoria
const events = await Event
    .select('events.*, categories.name as category_name')
    .join('categories', 'events.category_id = categories.id')
    .orderBy('events.created_at', 'DESC')
    .get();
```

### 2. LEFT JOIN
```javascript
// Buscar todos os usuários, mesmo os que não têm tickets
const users = await User
    .select('users.*, COUNT(tickets.id) as ticket_count')
    .leftJoin('tickets', 'users.id = tickets.user_id')
    .groupBy('users.id')
    .get();

// Buscar categorias, mesmo as que não têm eventos
const categories = await Category
    .select('categories.*, COUNT(events.id) as event_count')
    .leftJoin('events', 'categories.id = events.category_id')
    .groupBy('categories.id')
    .get();
```

### 3. RIGHT JOIN
```javascript
// Buscar todos os tickets, mesmo os que não têm usuário válido
const tickets = await Ticket
    .select('tickets.*, users.name as user_name')
    .rightJoin('users', 'tickets.user_id = users.id')
    .where({ 'tickets.status': 'pending' })
    .get();
```

### 4. FULL OUTER JOIN
```javascript
// Buscar todos os usuários e tickets (incluindo os que não têm correspondência)
const allData = await User
    .select('users.*, tickets.title as ticket_title')
    .fullJoin('tickets', 'users.id = tickets.user_id')
    .get();
```

### 5. CROSS JOIN
```javascript
// Produto cartesiano entre usuários e categorias
const combinations = await User
    .select('users.name, categories.name as category_name')
    .crossJoin('categories')
    .get();
```

## Exemplos Práticos

### Exemplo 1: Dashboard com Estatísticas
```javascript
// Buscar estatísticas de tickets por usuário
const stats = await Ticket
    .select(`
        users.name,
        COUNT(tickets.id) as total_tickets,
        COUNT(CASE WHEN tickets.status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN tickets.status = 'closed' THEN 1 END) as closed_tickets
    `)
    .join('users', 'tickets.user_id = users.id')
    .groupBy('users.id, users.name')
    .having('COUNT(tickets.id) > 5')
    .orderBy('total_tickets', 'DESC')
    .get();
```

### Exemplo 2: Eventos com Múltiplos Joins
```javascript
// Buscar eventos com categoria e usuário criador
const events = await Event
    .select(`
        events.*,
        categories.name as category_name,
        users.name as created_by_name
    `)
    .join('categories', 'events.category_id = categories.id')
    .join('users', 'events.created_by = users.id')
    .where({ 'events.status': 'active' })
    .orderBy('events.start_date', 'ASC')
    .get();
```

### Exemplo 3: Estatísticas com GROUP BY e HAVING
```javascript
// Buscar categorias com mais de 10 eventos
const popularCategories = await Category
    .select(`
        categories.name,
        COUNT(events.id) as event_count,
        AVG(events.duration) as avg_duration
    `)
    .leftJoin('events', 'categories.id = events.category_id')
    .groupBy('categories.id, categories.name')
    .having('COUNT(events.id) >= 10')
    .orderBy('event_count', 'DESC')
    .get();

// Buscar usuários com mais de 5 tickets em aberto
const activeUsers = await User
    .select(`
        users.name,
        users.email,
        COUNT(tickets.id) as open_tickets
    `)
    .join('tickets', 'users.id = tickets.user_id')
    .where({ 'tickets.status': 'open' })
    .groupBy('users.id, users.name, users.email')
    .having('COUNT(tickets.id) > 5')
    .orderBy('open_tickets', 'DESC')
    .get();
```

### Exemplo 3: Paginação com Joins
```javascript
// Paginar tickets com informações do usuário
const result = await Ticket
    .select('tickets.*, users.name as user_name')
    .join('users', 'tickets.user_id = users.id')
    .where({ 'tickets.priority': 'high' })
    .paginate(10, 1, {
        orderBy: [['tickets.created_at', 'DESC']]
    });
```

### Exemplo 4: Busca Complexa
```javascript
// Buscar tickets com múltiplas condições e joins
const tickets = await Ticket
    .select(`
        tickets.*,
        users.name as user_name,
        categories.name as category_name,
        events.title as event_title
    `)
    .join('users', 'tickets.user_id = users.id')
    .leftJoin('categories', 'tickets.category_id = categories.id')
    .leftJoin('events', 'tickets.event_id = events.id')
    .where({
        'tickets.status': 'open',
        'tickets.priority': 'high'
    })
    .orderBy('tickets.created_at', 'DESC')
    .limit(20)
    .get();
```

### Exemplo 5: Paginação com DataTables (Controller)
```javascript
// Controller: Paginar tickets para DataTables
const page = parseInt(req.query.page) || 1;
const perPage = parseInt(req.query.perPage) || 10;
const orderBy = [['id', 'DESC']];

const result = Ticket.dataTableQuery();
// (aplique filtros e buscas globais conforme necessário)
const pageResult = await result.paginate(perPage, page, { orderBy });
const tickets = pageResult.data;
const recordsTotal = pageResult.total;
const lastPage = pageResult.lastPage;

return res.json({
    data: tickets,
    recordsTotal,
    page,
    lastPage
});
```

## Métodos Disponíveis

### JOINs
- `join(table, condition)` - INNER JOIN
- `leftJoin(table, condition)` - LEFT JOIN
- `rightJoin(table, condition)` - RIGHT JOIN
- `fullJoin(table, condition)` - FULL OUTER JOIN
- `crossJoin(table)` - CROSS JOIN

### Agregação
- `groupBy(fields)` - GROUP BY (aceita string ou array)
- `having(condition, params)` - HAVING (condição e parâmetros opcionais)

### Paginação
- `paginate(perPage, page, options)`
    - `perPage`: Quantidade de registros por página
    - `page`: Página atual (1-based)
    - `options`: Objeto com filtros, ordenação, etc. (ex: `{ orderBy: [['id', 'DESC']] }`)
    - **Retorno:** `{ data, total, page, perPage, lastPage }`

## Observações

1. **Encadeamento**: Todos os métodos de join retornam a instância do modelo para permitir encadeamento
2. **Condições**: As condições devem ser escritas como strings SQL (ex: 'users.id = posts.user_id')
3. **Compatibilidade**: Funciona com todos os outros métodos do BaseModel (where, orderBy, limit, etc.)
4. **Performance**: Os joins são otimizados e executados em uma única query 