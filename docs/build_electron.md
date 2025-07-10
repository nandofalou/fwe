# Build e Personalização do Electron

## Como Gerar Builds

### Pré-requisitos

Antes de fazer o build, certifique-se de ter instalado as dependências:

```bash
npm install
```

### Scripts Disponíveis

O FWE Framework possui os seguintes scripts de build configurados no `package.json`:

#### Build Normal (Instalável)
```bash
npm run build
```
Gera um instalador executável (.exe) que pode ser distribuído e instalado em outros computadores.

#### Build Portable
```bash
npm run build:portable
```
Gera uma versão portable (.exe) que pode ser executada diretamente sem instalação.

### Configuração do Build

A configuração do build está no `package.json` na seção `build`:

```json
{
  "build": {
    "files": [
      "App/**/*",
      "Public/**/*", 
      "docs/**/*",
      "main.js",
      "package.json"
    ],
    "asarUnpack": [
      "App/Views",
      "Public",
      "docs"
    ]
  }
}
```

#### Explicação das Configurações:

- **`files`**: Define quais arquivos e pastas serão incluídos no build
- **`asarUnpack`**: Define quais pastas serão extraídas do arquivo asar (necessário para views, assets e docs)

## Personalização do Electron

### Ícone da Aplicação

Para adicionar um ícone personalizado:

1. **Crie um arquivo de ícone**:
   - Formato: `.ico` para Windows
   - Tamanho recomendado: 256x256 pixels
   - Nome sugerido: `icon.ico`

2. **Adicione a configuração no `package.json`**:
```json
{
  "build": {
    "win": {
      "icon": "build/icon.ico"
    }
  }
}
```

3. **Crie a pasta `build`** e coloque o ícone lá:
```
fwe/
├── build/
│   └── icon.ico
├── App/
├── Public/
└── ...
```

### Ícone da Barra de Tarefas

Para personalizar o ícone na barra de tarefas:

1. **No `main.js`**, adicione a configuração do ícone:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'build', 'icon.ico') // Ícone da janela
  });
  
  // ... resto do código
}
```

### Ícone do Tray (Bandeja do Sistema)

Para adicionar um ícone na bandeja do sistema:

1. **Crie um ícone para o tray** (formato `.ico` ou `.png`)
2. **Adicione o código no `main.js`**:

```javascript
const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;

function createTray() {
  // Criar ícone do tray
  tray = new Tray(path.join(__dirname, 'build', 'tray-icon.ico'));
  
  // Menu do tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir FWE',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Minimizar',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('FWE Framework');
  tray.setContextMenu(contextMenu);
  
  // Duplo clique no tray abre a janela
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

// Chamar createTray() após app.whenReady()
app.whenReady().then(() => {
  createWindow();
  createTray(); // Adicionar esta linha
});
```

### Configurações Avançadas do Build

#### Configuração Completa do `package.json`:

```json
{
  "build": {
    "appId": "com.fwe.app",
    "productName": "FWE Framework",
    "directories": {
      "output": "dist"
    },
    "files": [
      "App/**/*",
      "Public/**/*",
      "docs/**/*",
      "main.js",
      "package.json"
    ],
    "asarUnpack": [
      "App/Views",
      "Public",
      "docs"
    ],
    "win": {
      "icon": "build/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

#### Explicação das Configurações Avançadas:

- **`appId`**: Identificador único da aplicação
- **`productName`**: Nome que aparece no instalador
- **`directories.output`**: Pasta onde os builds serão gerados
- **`win.target`**: Define os tipos de build (nsis = instalável, portable = portátil)
- **`nsis`**: Configurações do instalador NSIS

### Dicas Importantes

#### 1. Estrutura de Pastas Recomendada:
```
fwe/
├── build/
│   ├── icon.ico          # Ícone principal
│   ├── tray-icon.ico     # Ícone do tray
│   └── installer.ico     # Ícone do instalador
├── dist/                 # Builds gerados
├── App/
├── Public/
├── docs/
└── ...
```

#### 2. Otimização de Tamanho:
- Use ícones `.ico` otimizados
- Remova arquivos desnecessários da pasta `files`
- Considere usar `asar: false` para desenvolvimento

#### 3. Debug de Build:
- Verifique os logs no terminal durante o build
- Teste sempre o build gerado
- Use `--debug` no electron-builder para mais informações

#### 4. Distribuição:
- **Instalável**: Ideal para usuários finais
- **Portable**: Ideal para demonstrações e testes
- **Auto-updater**: Considere implementar atualizações automáticas

### Comandos Úteis

```bash
# Build com debug
npm run build -- --debug

# Build apenas para Windows
npm run build -- --win

# Build específico (portable)
npm run build:portable

# Limpar builds anteriores
rm -rf dist/

# Verificar configuração
npx electron-builder --help
```

### Troubleshooting

#### Problema: Build falha
- Verifique se todas as dependências estão instaladas
- Certifique-se de que os caminhos dos ícones estão corretos
- Verifique se não há arquivos faltando na lista `files`

#### Problema: Ícone não aparece
- Use formato `.ico` para Windows
- Tamanho mínimo recomendado: 256x256
- Verifique se o caminho está correto no `package.json`

#### Problema: Aplicação não inicia no build
- Verifique se todas as pastas estão em `asarUnpack`
- Teste o caminho das views e assets
- Verifique os logs de erro no console

### Próximos Passos

1. **Personalize os ícones** conforme sua marca
2. **Configure o auto-updater** para distribuição
3. **Implemente notificações** no tray
4. **Adicione atalhos de teclado** globais
5. **Configure o comportamento de inicialização** automática

O FWE Framework está pronto para ser distribuído como uma aplicação desktop profissional! 🚀 