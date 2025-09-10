# Funcionalidades do Electron

Este documento descreve as funcionalidades específicas da aplicação Electron do framework FWE.

---

## 🖥️ Interface do Usuário

### Janela Principal
- **Dimensões**: 1200x800 pixels
- **Comportamento**: Carrega automaticamente a página inicial com status do servidor
- **Redirecionamento**: Automaticamente redireciona para a URL do projeto quando o servidor estiver ativo

### Janela de Configuração
- **Dimensões**: 800x600 pixels
- **Funcionalidade**: Interface completa para configuração do sistema
- **Acesso**: Disponível através do menu do tray

---

## 🔧 Sistema de Tray

### Menu Principal
O tray oferece as seguintes opções:

#### **Abrir Aplicação**
- Abre a janela principal
- Se o servidor estiver rodando, carrega diretamente a URL do projeto
- Se o servidor estiver parado, mostra a página de status

#### **Configuração**
- Abre a janela de configuração
- Permite editar todas as configurações do sistema
- Interface com abas para organização

#### **Servidor**
- **Iniciar**: Inicia o servidor web
- **Parar**: Para o servidor web
- **Status**: Mostra o status atual (Rodando/Parado)

#### **Sair**
- Encerra completamente a aplicação

---

## ⚙️ Sistema de Configuração

### Interface de Configuração
A janela de configuração oferece uma interface completa para gerenciar o sistema:

#### **Aba Status do Servidor**
- **Indicador Visual**: Mostra se o servidor está rodando ou parado
- **Controles**: Botões para iniciar/parar o servidor
- **Informações**: Porta, URL base e status atual

#### **Aba Configurações**
- **Servidor**: Porta, CORS, autostart, URL base
- **Banco de Dados**: Driver (SQLite/MySQL) com campos condicionais
- **Logging**: Console, arquivo, caminho, maxline
- **JWT**: Chave secreta e tempo de expiração

### Funcionalidades Especiais

#### **Campos Condicionais**
- **SQLite**: Mostra campos específicos (caminho, charset)
- **MySQL**: Mostra campos específicos (host, usuário, senha, database, porta, charset)
- **Backup**: Botão de backup visível apenas para SQLite

#### **Validação e Salvamento**
- **Validação**: Campos obrigatórios são validados
- **Salvamento**: Configurações são salvas no `config.ini` do usuário
- **Recarregamento**: Botão para recarregar configurações do arquivo

---

## 🔒 Segurança

### Controle de Navegação
- **Bloqueio de Novas Janelas**: Impede abertura de novas janelas não autorizadas
- **Domínios Permitidos**: Lista de domínios autorizados para navegação
- **Redirecionamento Seguro**: Redireciona para página inicial em caso de erro

### Configuração de Segurança
```javascript
const SECURITY_CONFIG = {
    allowNewWindows: false,
    allowedDomains: [
        'http://localhost:9000',
        'http://127.0.0.1:9000',
        'data:',
        'file://'
    ]
};
```

---

## 📁 Estrutura de Arquivos

### Views do Sistema
As páginas HTML do sistema estão organizadas em:
```
App/Views/fwesystem/
├── config.html          # Página de configuração
├── initial.html         # Página inicial de status
├── error.html           # Página de erro genérico
├── config-error.html    # Página de erro da configuração
└── file-not-found.html  # Página de arquivo não encontrado
```

### Configuração do Usuário
- **Localização**: `~/fwe/config.ini` (diretório do usuário)
- **Formato**: Arquivo INI com seções organizadas
- **Backup**: Funcionalidade de backup para banco SQLite

---

## 🚀 Funcionalidades Avançadas

### Comunicação IPC
O sistema usa Inter-Process Communication (IPC) para:
- **Status do Servidor**: Verificação em tempo real
- **Configurações**: Carregamento e salvamento
- **Controle de Janelas**: Gerenciamento de estado

### Gerenciamento de Estado
- **Servidor**: Controle automático de início/parada
- **Janelas**: Gerenciamento de múltiplas janelas
- **Tray**: Atualização dinâmica do menu

### Logs e Monitoramento
- **Logs Detalhados**: Sistema completo de logging
- **Status em Tempo Real**: Monitoramento do servidor
- **Tratamento de Erros**: Páginas de erro personalizadas

---

## 📋 Exemplos de Uso

### Iniciando a Aplicação
1. Execute `npm start` ou `npm run dev`
2. A aplicação inicia com o tray ativo
3. Clique em "Abrir Aplicação" para acessar a interface

### Configurando o Sistema
1. Clique com o botão direito no tray
2. Selecione "Configuração"
3. Ajuste as configurações desejadas
4. Clique em "Atualizar Configurações"

### Gerenciando o Servidor
1. Use o menu "Servidor" no tray
2. Ou use os controles na janela de configuração
3. O status é atualizado automaticamente

---

## 🔧 Desenvolvimento

### Modo de Desenvolvimento
- **Comando**: `npm run dev`
- **Recarregamento**: Automático com nodemon
- **DevTools**: Abertos automaticamente na janela de configuração

### Build de Produção
- **Comando**: `npm run build:portable`
- **Saída**: Executável portável para Windows
- **Otimizações**: Aplicadas automaticamente

---

## 📚 Recursos Adicionais

### Documentação Relacionada
- [config_ini.md](./config_ini.md) - Configurações do sistema
- [build_electron.md](./build_electron.md) - Build e distribuição
- [ciclo_de_vida_app.md](./ciclo_de_vida_app.md) - Ciclo de vida da aplicação

### Suporte
- Consulte os logs da aplicação para diagnóstico
- Use o modo de desenvolvimento para debugging
- Verifique as configurações através da interface

---

Mantenha este documento atualizado conforme novas funcionalidades forem adicionadas!
