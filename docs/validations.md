# Manual de Uso do Sistema de Validação

O sistema de validação do framework permite validar dados de requisições de forma simples e padronizada, inspirado em frameworks modernos.

## Como funciona?

- As regras de validação são declaradas como strings separadas por pipe (`|`).
- O helper `Validator` expõe o método estático `validate(data, rules)`.
- O resultado da validação informa se os dados são válidos e, se não forem, quais campos estão com erro.

---

## Exemplo Básico de Uso

```js
const Validator = require('../Helpers/Validator');

const rules = {
  name: 'required|string|max:200',
  email: 'required|email',
  age: 'numeric|optional|between:18,99'
};

const data = {
  name: '',
  email: 'teste@',
  age: 17
};

const result = Validator.validate(data, rules);

if (!result.isValid) {
  console.log(result.errors);
  // Saída:
  // {
  //   name: 'Campo obrigatório',
  //   email: 'Email inválido',
  //   age: 'Valor deve estar entre 18 e 99'
  // }
}
```

---

## Regras Suportadas

- `required` — campo obrigatório
- `optional` — campo opcional
- `string` — deve ser string
- `numeric` — deve ser número
- `email` — deve ser email válido
- `min:N` — mínimo de caracteres
- `max:N` — máximo de caracteres
- `in:VAL1,VAL2` — valor deve estar entre as opções
- `not_in:VAL1,VAL2` — valor não pode ser uma das opções
- `between:MIN,MAX` — valor numérico entre MIN e MAX
- `size:N` — tamanho exato
- `date` — data válida
- `date_format:FORMATO` — data no formato especificado
- `url` — URL válida
- `ip` — IP válido
- `json` — JSON válido
- `regex:REGEX` — regex customizado
- `alpha` — apenas letras
- `alpha_num` — letras e números
- `alpha_dash` — letras, números, traço e underscore

---

## Exemplo de Validator Customizado

```js
// App/Validations/UserValidator.js
const Validator = require('../Helpers/Validator');

class UserValidator {
    static validateCreate(data) {
        const rules = {
            name: 'required|string|max:200',
            email: 'required|email|max:200',
            pass: 'required|min:6',
            active: 'numeric',
            permission_id: 'numeric',
        };
        return Validator.validate(data, rules);
    }

    static validateUpdate(data) {
        const rules = {
            name: 'max:200',
            email: 'email|max:200',
            pass: 'min:6',
            active: 'numeric',
            permission_id: 'numeric',
        };
        return Validator.validate(data, rules);
    }
}

module.exports = UserValidator;
```

---

## Exemplo de Resposta de Erro

```json
{
  "isValid": false,
  "errors": {
    "name": "Campo obrigatório",
    "email": "Email inválido"
  },
  "validated": {}
}
```

---

## Dicas

- Sempre use o validator no controller antes de criar ou atualizar dados.
- Para campos opcionais, use `optional` na regra.
- Para mensagens customizadas, trate no controller ao montar a resposta para o usuário.
- Consulte os validators existentes em `App/Validations/` para exemplos práticos.

---

## Avançado: Adicionando Novas Regras

Se precisar de uma regra customizada, adicione um novo case no método `validate` do arquivo `App/Helpers/Validator.js`.

Exemplo:
```js
case 'cpf':
    if (value && !isValidCPF(value)) {
        errors[field] = 'CPF inválido';
    }
    break;
```

---

## Referência Rápida

- **Declarar regras:** string separada por pipe
- **Validar:** `Validator.validate(data, rules)`
- **Verificar resultado:** `result.isValid`, `result.errors`

---

Mantenha sempre o padrão para garantir consistência e facilidade de manutenção! 