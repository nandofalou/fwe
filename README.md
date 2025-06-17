# FWE - Framework Electron

Um framework inspirado no CodeIgniter 4 para aplicações desktop usando Electron.

## Características

- Backend em JavaScript com Electron
- Estrutura MVC inspirada no CodeIgniter 4
- Suporte a SQLite e MySQL/MariaDB
- Autenticação JWT
- API REST com documentação Swagger
- Interface desktop para gerenciamento do serviço
- Sistema de rotas similar ao CodeIgniter 4
- Helpers e bibliotecas padrão
- Validação de requisições
- CORS habilitado

## Estrutura de Diretórios

```
fwe/
├── App/
│   ├── config/
│   ├── Controllers/
│   ├── Models/
│   ├── Libraries/
│   ├── Validations/
│   ├── Filters/
│   ├── Helpers/
│   └── Views/
├── Public/
└── main.js
```

## Requisitos

- Node.js 18+
- Electron 28+
- SQLite ou MySQL/MariaDB

## Instalação

1. Clone o repositório
2. Execute `npm install`
3. Execute `npm start` para iniciar em modo desenvolvimento

## Configuração

O sistema criará automaticamente um arquivo `config.ini` no diretório do usuário com as configurações padrão.

## Desenvolvimento

- Branch principal: `master`
- Branch de desenvolvimento: `develop`

## Licença

MIT 