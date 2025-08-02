# DateHelper - Helper de Data (inspirado no CodeIgniter)

Este helper oferece funções utilitárias para manipulação de datas e horários, facilitando operações comuns em CRUDs, logs e relatórios.

## Métodos disponíveis

### now(asString = false)
Retorna a data/hora atual.
- `asString = false` (padrão): retorna um objeto Date.
- `asString = true`: retorna string no formato SQL `YYYY-MM-DD HH:mm:ss`.

**Exemplo:**
```js
DateHelper.now(); // Date
DateHelper.now(true); // '2024-05-30 14:23:00'
```

### toDate(date)
Converte para data no formato `YYYY-MM-DD`.
```js
DateHelper.toDate('2024-05-30T14:23:00'); // '2024-05-30'
```

### toDateTime(date)
Converte para data/hora no formato `YYYY-MM-DD HH:mm:ss`.
```js
DateHelper.toDateTime(new Date()); // '2024-05-30 14:23:00'
```

### toTime(date)
Converte para hora no formato `HH:mm:ss`.
```js
DateHelper.toTime(new Date()); // '14:23:00'
```

### format(date, format)
Formata a data/hora conforme o padrão informado.
- Suporta: DD, MM, YYYY, HH, mm, ss
```js
DateHelper.format(new Date(), 'DD/MM/YYYY HH:mm:ss'); // '30/05/2024 14:23:00'
```

### addDays(date, days)
Soma dias à data.
```js
DateHelper.addDays('2024-05-30', 5); // Date de 2024-06-04
```

### addMonths(date, months)
Soma meses à data.
```js
DateHelper.addMonths('2024-05-30', 1); // Date de 2024-06-30
```

### addYears(date, years)
Soma anos à data.
```js
DateHelper.addYears('2024-05-30', 1); // Date de 2025-05-30
```

### diffInDays(date1, date2)
Diferença em dias entre duas datas.
```js
DateHelper.diffInDays('2024-05-30', '2024-06-04'); // 5
```

### diffInHours(date1, date2)
Diferença em horas entre duas datas.

### diffInMinutes(date1, date2)
Diferença em minutos entre duas datas.

### isValid(date)
Verifica se a data é válida.
```js
DateHelper.isValid('2024-05-30'); // true
DateHelper.isValid('data inválida'); // false
```

### isBetween(date, start, end)
Verifica se uma data está entre duas outras.
```js
DateHelper.isBetween('2024-05-30', '2024-05-01', '2024-06-01'); // true
```

### toSql(date)
Retorna a data/hora no formato SQL `YYYY-MM-DD HH:mm:ss`.

### toTimestamp(date)
Retorna o timestamp (milissegundos).

---

**Utilize este helper para padronizar datas em todo o projeto!** 