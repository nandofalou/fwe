# Documentação de Views e Layouts (EJS)

## Visão Geral

O projeto utiliza EJS puro para renderização de views, com um padrão de layout base e simulação de sections (blocos de conteúdo) de forma manual, sem dependências externas. Isso garante compatibilidade total com qualquer ambiente Node.js, incluindo Electron.

## Estrutura de Layout

O layout base (`App/Views/layouts/main.ejs`) centraliza o HTML principal, cabeçalho, rodapé, inclusão de CSS/JS e o ponto de injeção do conteúdo de cada página.

**Exemplo de layout base:**
```ejs
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title><%= typeof title !== 'undefined' ? title : 'FWE Framework' %></title>
    <link rel="stylesheet" href="/css/auth.css">
    <link rel="stylesheet" href="/css/flash.css">
    <% if (typeof styles !== 'undefined') { %><%- styles %><% } %>
</head>
<body>
    <div class="container">
        <!-- Flash Messages -->
        <% if (flash && Object.keys(flash).length > 0) { %>
            <% Object.keys(flash).forEach(function(key) { %>
                <% const message = flash[key]; %>
                <div class="flash-message <%= message.type %>" id="flash-<%= key %>">
                    <span class="icon">
                        <% if (message.type === 'success') { %>✅<% } %>
                        <% if (message.type === 'error') { %>❌<% } %>
                        <% if (message.type === 'warning') { %>⚠️<% } %>
                        <% if (message.type === 'info') { %>ℹ️<% } %>
                    </span>
                    <span><%= message.message %></span>
                    <button class="close" onclick="this.parentElement.remove()">×</button>
                </div>
            <% }); %>
        <% } %>
        <!-- Conteúdo principal -->
        <%- body %>
    </div>
    <script src="/js/flash.js"></script>
    <% if (typeof scripts !== 'undefined') { %><%- scripts %><% } %>
</body>
</html>
```

## Como criar uma view com layout e sections

1. **Defina os blocos de conteúdo como variáveis no início da view:**

```ejs
<%
var styles = `
<style>
  /* CSS específico da página */
</style>
`;

var body = `
<div class="content">
  <!-- Conteúdo principal da página -->
</div>
`;

var scripts = `
<script>
  // JS específico da página
</script>
`;
%>
```

2. **Inclua o layout base, passando as variáveis:**

```ejs
<%- include('layouts/main', { title, flash, styles, body, scripts }) %>
```

- `title`: Título da página (opcional)
- `flash`: Mensagens flash (opcional, geralmente já disponível)
- `styles`: Bloco de CSS específico da página
- `body`: Bloco principal de HTML da página
- `scripts`: Bloco de JS específico da página

## Exemplo completo de view

```ejs
<%
var styles = `
<style>
  .minha-pagina { color: #333; }
</style>
`;

var body = `
<div class="minha-pagina">
  <h1>Minha Página</h1>
  <p>Bem-vindo à minha página customizada!</p>
</div>
`;

var scripts = `
<script>
  // JS opcional
</script>
`;
%>
<%- include('layouts/main', { title: 'Minha Página', flash, styles, body, scripts }) %>
```

## Dicas e Boas Práticas
- Sempre use o layout base para garantir consistência visual.
- Coloque apenas o CSS/JS específico da página nos blocos `styles` e `scripts`.
- O bloco `body` pode conter qualquer HTML, inclusive outros includes EJS.
- Para partials reutilizáveis, use a pasta `App/Views/Cells/` e inclua com `<%- include('Cells/nome', { ... }) %>`.
- O padrão é inspirado no `extend`/`section` do CodeIgniter, mas funciona em qualquer ambiente EJS puro.

## Exemplos reais
- Veja `App/Views/example.ejs` e `App/Views/auth/login.ejs` para exemplos práticos.

---

Se precisar criar novos layouts ou dúvidas sobre views, consulte este arquivo ou peça exemplos! 