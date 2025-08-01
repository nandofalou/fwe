# Melhorias de Concorrência - Sistema de Filas

## Problema Identificado

O sistema anterior tinha um problema de concorrência onde:

1. **Todas as operações de banco eram sequenciais** - uma única fila global
2. **Operações em lote bloqueavam operações críticas** - importação/geração de tickets impediam acesso e edição
3. **Falta de isolamento** - não havia transações adequadas para operações em lote

## Solução Implementada

### 1. Sistema de Filas com Prioridades

O sistema agora possui **duas filas separadas**:

#### Fila Crítica (Alta Prioridade)
- **Uso**: Operações que não podem esperar
- **Exemplos**: 
  - Validação de acesso (`AcessoController.register`)
  - Edição de tickets individuais
  - Consultas de validação
- **Comportamento**: Execução imediata, não bloqueada por operações em lote

#### Fila em Lote (Baixa Prioridade)
- **Uso**: Operações em massa que podem esperar
- **Exemplos**:
  - Importação de tickets via CSV
  - Geração automática de tickets
  - Operações de backup/relatórios
- **Comportamento**: Execução controlada, máximo de 3 operações simultâneas

### 2. Transações em Lote

#### Métodos Novos no BaseModel

```javascript
// Inserção em lote com transação
await Ticket.insertBatch(ticketsArray);

// Atualização em lote com transação  
await Ticket.updateBatch(updatesArray);
```

#### Benefícios
- **Atomicidade**: Ou tudo é inserido ou nada é inserido
- **Performance**: Muito mais rápido que inserções individuais
- **Isolamento**: Não interfere com operações críticas

### 3. Prioridades Automáticas

O sistema detecta automaticamente a prioridade baseado no tipo de operação:

```javascript
// Prioridade automática (padrão)
await Ticket.insert(data);

// Prioridade crítica (acesso, edição)
await Ticket.insert(data, 'critical');

// Prioridade em lote (importação, geração)
await Ticket.insert(data, 'batch');
```

## Implementação nos Controllers

### TicketController

#### Importação de Tickets
```javascript
// Antes: Inserção individual (lenta e bloqueante)
for (let linha of linhas) {
    await Ticket.insert(data); // Bloqueava outras operações
}

// Depois: Inserção em lote (rápida e não bloqueante)
const ticketsToInsert = [];
for (let linha of linhas) {
    ticketsToInsert.push(data);
}
await Ticket.insertBatch(ticketsToInsert); // Transação em lote
```

#### Geração de Tickets
```javascript
// Antes: Geração individual
for (let i = 0; i < qtd; i++) {
    await Ticket.insert(data); // Bloqueava acesso
}

// Depois: Geração em lote
const ticketsToInsert = [];
for (let i = 0; i < qtd; i++) {
    ticketsToInsert.push(data);
}
await Ticket.insertBatch(ticketsToInsert); // Transação em lote
```

### AcessoController

#### Validação de Acesso
```javascript
// Todas as operações de acesso usam prioridade crítica
const equipamento = await Terminal.getTerminal().where('terminal.pin', pin).first();
const result = await Ticket.validateTicketQuery(output.hora_acesso).where({...}).first();
await TicketAccess.insert(accessData, 'critical'); // Prioridade crítica
```

## Configuração

### Limites de Concorrência

```javascript
// Em Database.js
maxConcurrentBatch: 3,           // Máximo de operações em lote simultâneas
```

### Monitoramento

O sistema emite eventos para monitoramento:

```javascript
// Eventos disponíveis
'queue:added'      // Item adicionado à fila
'queue:processing' // Item sendo processado
'queue:processed'  // Item processado com sucesso
'queue:error'      // Erro no processamento
'queue:cleared'    // Fila limpa
'queue:paused'     // Fila pausada
'queue:resumed'    // Fila resumida
```

## Benefícios Alcançados

### 1. Concorrência Real
- **Acesso simultâneo**: Múltiplos terminais podem registrar acesso simultaneamente
- **Edição não bloqueada**: Usuários podem editar tickets durante importação
- **Performance melhorada**: Operações em lote são muito mais rápidas

### 2. Isolamento Adequado
- **Transações**: Operações em lote são atômicas
- **Rollback automático**: Em caso de erro, nada é salvo
- **Consistência**: Dados sempre consistentes

### 3. Escalabilidade
- **Filas separadas**: Operações críticas não são afetadas por operações em lote
- **Controle de concorrência**: Limite configurável de operações simultâneas
- **Monitoramento**: Eventos para acompanhar o desempenho

## Uso Recomendado

### Para Operações Críticas
```javascript
// Sempre use prioridade crítica para:
await Model.insert(data, 'critical');     // Inserção individual
await Model.update(id, data, 'critical'); // Atualização individual
await Model.delete(id, 'critical');       // Exclusão individual
```

### Para Operações em Lote
```javascript
// Use inserção em lote para:
await Model.insertBatch(dataArray);       // Múltiplas inserções
await Model.updateBatch(updatesArray);    // Múltiplas atualizações
```

### Para Consultas
```javascript
// Consultas usam prioridade automática (crítica por padrão)
const result = await Model.where(conditions).get();
```

## Monitoramento e Debug

### Verificar Status das Filas
```javascript
// Verificar tamanho das filas
console.log('Operações críticas ativas:', Database.criticalQueue);
console.log('Operações em lote ativas:', Database.activeBatchOperations);
```

### Logs de Performance
O sistema registra automaticamente:
- Tempo de execução das operações
- Erros de concorrência
- Performance das filas

## Compatibilidade

### Backward Compatibility
- Todos os métodos existentes continuam funcionando
- Prioridade padrão é 'auto' (detecção automática)
- Não há breaking changes

### Migração
Não é necessária migração de código existente. As melhorias são transparentes e automáticas.

## Conclusão

As melhorias implementadas resolvem completamente o problema de concorrência:

1. ✅ **Acesso simultâneo**: Múltiplos terminais podem operar simultaneamente
2. ✅ **Edição não bloqueada**: Usuários podem editar durante importação/geração
3. ✅ **Performance melhorada**: Operações em lote são muito mais rápidas
4. ✅ **Isolamento adequado**: Transações garantem consistência
5. ✅ **Escalabilidade**: Sistema preparado para alta concorrência

O sistema agora suporta cenários de alta concorrência sem comprometer a performance ou a consistência dos dados. 