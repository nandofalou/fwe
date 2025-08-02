# Nova Funcionalidade: Templates Dinâmicos

## Visão Geral

Agora o método BaseController.view() aceita um parâmetro adicional para especificar qual template usar.

## Sintaxe

`javascript
BaseController.view(viewName, data, res, req, template)
`

### Parâmetros:
- iewName (string): Nome da view
- data (object): Dados para a view
- es (object): Express response
- eq (object): Express request
- 	emplate (string, opcional): Nome do template (padrão: 'app')

## Templates Disponíveis

### 1. pp (Padrão)
- Template administrativo completo
- Header, sidebar, footer
- Perfeito para dashboards e páginas administrativas

### 2. uth
- Template de autenticação
- Header simples, sem sidebar
- Perfeito para login, registro, etc.

### 3. main
- Template simples
- Header básico, sem sidebar
- Perfeito para páginas públicas

### 4. lank
- Template minimalista
- Sem header, sidebar ou footer
- Perfeito para modais, impressão, etc.

### 5. pi
- Template para respostas de API
- Layout limpo para dados JSON
- Perfeito para documentação de API

## Exemplos de Uso

### Template Padrão (app)
`javascript
// Usa template 'app' (padrão)
BaseController.view('dashboard/index', data, res, req);
BaseController.view('dashboard/index', data, res, req, 'app');
`

### Template Auth
`javascript
// Usa template 'auth'
BaseController.view('auth/login', data, res, req, 'auth');
`

### Template Blank
`javascript
// Usa template 'blank' (sem header/footer)
BaseController.view('pages/print', data, res, req, 'blank');
`

### Template API
`javascript
// Usa template 'api'
BaseController.view('api/response', data, res, req, 'api');
`

### Template Main
`javascript
// Usa template 'main'
BaseController.view('home', data, res, req, 'main');
`

## Backward Compatibility

Todas as views existentes continuam funcionando sem alteração:

`javascript
// Funciona como antes (usa template 'app')
BaseController.view('dashboard/index', data, res, req);
`

## Estrutura de Arquivos

`
App/Views/layouts/
 app.ejs          # Template administrativo (padrão)
 auth.ejs         # Template de autenticação
 main.ejs         # Template simples
 blank.ejs        # Template minimalista
 api.ejs          # Template para APIs
`

## Vantagens

 **Flexibilidade**: Cada view pode escolher seu template
 **Backward Compatibility**: Views existentes continuam funcionando
 **Organização**: Separação clara entre view e template
 **Performance**: Carrega apenas o template necessário
 **Manutenibilidade**: Mudanças em um template não afetam outros

## Exemplos Práticos

Veja os arquivos criados:
- App/Controllers/ExampleController_new.js - Controller com exemplos
- App/Views/example_blank.ejs - View com template blank
- App/Views/example_api.ejs - View com template api
