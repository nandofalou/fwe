# Como Criar um Recurso com View (Página Web)

Este guia mostra como criar um recurso completo com interface web (view) no FWE Framework, renderizando uma página no navegador.

## Passo 1: Criar o Controller

No diretório `App/Controllers/`, crie um novo arquivo, por exemplo, `ProdutoController.js`:

```js
const BaseController = require('./BaseController');

class ProdutoController extends BaseController {
    static async index(req, res) {
        // Dados para a view
        const produtos = [
            { id: 1, nome: 'Produto A' },
            { id: 2, nome: 'Produto B' }
        ];
        return BaseController.view('produtos/index', { produtos }, res, req);
    }
}

module.exports = ProdutoController;
```

## Passo 2: Criar a View EJS

No diretório `App/Views/produtos/`, crie o arquivo `index.ejs`:

```ejs
<% var body = `
    <h1>Lista de Produtos</h1>
    <ul>
        <% produtos.forEach(function(produto) { %>
            <li><%= produto.nome %></li>
        <% }); %>
    </ul>
`; %>
<%- include('../layouts/main', { title: 'Produtos', body }) %>
```

## Passo 3: Adicionar a Rota

No arquivo de rotas (ex: `App/Config/Routes/RoutesWeb.js`):

```js
const ProdutoController = require('../../Controllers/ProdutoController');

router.get('/produtos', ProdutoController.index);
```

## Passo 4: Acessar no Navegador

Abra o navegador e acesse: `http://localhost:9000/produtos`

Você verá a lista de produtos renderizada pela view.

---

**Dicas:**
- Use o layout base para manter o padrão visual.
- Para páginas com formulário, crie um novo método e view para o formulário.
- Consulte outros exemplos em `App/Views/` e `App/Controllers/`. 