const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const os = require('os');
const Log = require('./App/Helpers/Log');

// Configurações globais
let mainWindow;
let configWindow = null;
let apiServer = null;
let config = null;
let tray = null;
let isQuitting = false;

// Configurações de segurança
const SECURITY_CONFIG = {
    allowNewWindows: false, // Bloquear abertura de novas janelas
    allowedDomains: [
        'http://localhost:9000',
        'http://127.0.0.1:9000',
        'data:',
        'file://'
    ]
};

// Função para criar a janela principal
function createWindow() {
    try {
        Log.info('Criando janela principal...');
        
        // Verificar se o ícone existe
        let iconPath = path.join(__dirname, 'build', 'icon.ico');
        if (!fs.existsSync(iconPath)) {
            Log.warning('Ícone da janela não encontrado, tentando alternativas...');
            iconPath = path.join(process.resourcesPath, 'build', 'icon.ico');
            if (!fs.existsSync(iconPath)) {
                Log.warning('Ícone não encontrado, usando ícone padrão');
                iconPath = null;
            }
        }
        
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            icon: iconPath,
            autoHideMenuBar: true, // Esconde a barra de menu
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        Log.info('Janela principal criada com sucesso');

        // Desabilitar o menu completamente
        mainWindow.setMenu(null);

        // Criar o tray
        createTray();

        // Carregar página inicial informativa na janela principal
        loadInitialPage();

        // Interceptar o fechamento da janela para minimizar ao tray
        mainWindow.on('close', (event) => {
            if (!isQuitting) {
                event.preventDefault();
                mainWindow.hide();
            }
        });
        
        // Em desenvolvimento, abrir DevTools
        if (process.argv.includes('--dev')) {
            mainWindow.webContents.openDevTools();
        }

        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            Log.error('Falha ao carregar a janela principal', { errorCode, errorDescription });
            // Carregar página de erro do sistema
            loadSystemHTML(mainWindow, 'error.html');
        });

        // Interceptar abertura de novas janelas
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            if (SECURITY_CONFIG.allowNewWindows) {
                Log.info('Abertura de nova janela permitida:', url);
                return { action: 'allow' };
            } else {
                Log.info('Tentativa de abrir nova janela bloqueada:', url);
                return { action: 'deny' };
            }
        });

        // Interceptar cliques em links que tentam abrir em nova aba/janela
        mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
            const isAllowed = SECURITY_CONFIG.allowedDomains.some(domain => navigationUrl.startsWith(domain));
            
            if (!isAllowed) {
                Log.info('Navegação bloqueada para URL externa:', navigationUrl);
                event.preventDefault();
                
                // Se o servidor não está rodando, voltar para a página inicial
                if (!apiServer) {
                    Log.info('Servidor não está rodando, voltando para página inicial');
                    loadInitialPage();
                }
            }
        });

        mainWindow.webContents.on('did-finish-load', () => {
            Log.info('Arquivo HTML carregado com sucesso');
            // Verificar se o servidor deve iniciar automaticamente
            if (config.server.autostart) {
                Log.info('Servidor configurado para iniciar automaticamente');
                setTimeout(async () => {
                    try {
                        await startServer();
                        updateTrayMenu();
                        updateMainWindow();
                    } catch (error) {
                        Log.error('Erro ao iniciar servidor automaticamente', { error: error.message });
                    }
                }, 2000); // Aguardar 2 segundos para a página carregar
            }
        });
        
        Log.info('Janela principal configurada com sucesso');
    } catch (error) {
        Log.error('Erro ao criar janela principal', { error: error.message, stack: error.stack });
        throw error;
    }
}

// Função para inicializar configurações
function initializeConfig() {
    const userHome = os.homedir();
    const configDir = path.join(userHome, 'fwe');
    const configPath = path.join(configDir, 'config.ini');

    // Criar diretório se não existir
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    // Criar arquivo de configuração padrão se não existir
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            database: {
                driver: 'sqlite',
                sqlite: {
                    path: path.join(configDir, 'database.sqlite'),
                    charset: 'utf8'
                },
                mysql: {
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    database: 'fwe',
                    charset: 'utf8mb4'
                }
            },
            server: {
                port: 3000,
                cors: true,
                autostart: false
            },
            jwt: {
                secret: 'your-secret-key',
                expiresIn: '24h'
            },
            logging: {
                console: true,
                file: true,
                path: path.join(configDir, 'logs')
            }
        };

        fs.writeFileSync(configPath, ini.stringify(defaultConfig));
        Log.info('Arquivo de configuração padrão criado', { path: configPath });
    }

    // Carregar configurações
    config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
    Log.info('Configurações carregadas', { configPath });

    return config;
}

// Função helper para carregar arquivos HTML do sistema
function loadSystemHTML(window, filename, fallbackHTML = null) {
    const htmlPath = path.join(__dirname, 'App', 'Views', 'fwesystem', filename);
    
    if (fs.existsSync(htmlPath)) {
        try {
            window.loadFile(htmlPath);
            Log.info(`Arquivo HTML carregado: ${filename}`);
            return true;
        } catch (error) {
            Log.error(`Erro ao carregar arquivo HTML ${filename}:`, error.message);
        }
    } else {
        Log.warning(`Arquivo HTML não encontrado: ${filename}`);
    }
    
    // Fallback para HTML inline se fornecido
    if (fallbackHTML) {
        window.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fallbackHTML));
        Log.info(`Fallback HTML carregado para ${filename}`);
        return true;
    }
    
    return false;
}

// Função para carregar a página inicial
function loadInitialPage() {
    if (!mainWindow) return;
    
    const fallbackHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>FWE - Framework</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; }
            .status { padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info { background-color: #e3f2fd; border: 1px solid #2196f3; }
            .warning { background-color: #fff3e0; border: 1px solid #ff9800; }
            .success { background-color: #e8f5e8; border: 1px solid #4caf50; }
            .loading { background-color: #f3e5f5; border: 1px solid #9c27b0; }
            button { padding: 10px 20px; margin: 10px; font-size: 16px; cursor: pointer; }
            .btn-primary { background-color: #2196f3; color: white; border: none; border-radius: 3px; }
            .btn-success { background-color: #4caf50; color: white; border: none; border-radius: 3px; }
            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 FWE - Framework</h1>
            <div id="statusContainer" class="status loading">
                <div class="spinner"></div>
                <h3>Verificando status do servidor...</h3>
                <p id="statusMessage">Aguarde enquanto verificamos se o servidor está ativo.</p>
            </div>
            <div id="instructions" class="status warning" style="display: none;">
                <h4>📋 Como usar:</h4>
                <ol style="text-align: left;">
                    <li>Clique no ícone do FWE na bandeja do sistema (tray)</li>
                    <li>Selecione "Configuração"</li>
                    <li>Clique em "Iniciar Servidor"</li>
                    <li>Esta página será atualizada automaticamente</li>
                </ol>
            </div>
            <div id="buttons" style="display: none;">
                <button class="btn-primary" onclick="checkServerStatus()">🔄 Verificar Status</button>
                <button class="btn-success" onclick="window.open('http://localhost:9000', '_blank')">🌐 Abrir Projeto</button>
            </div>
        </div>
        
        <script>
            const { ipcRenderer } = require('electron');
            
            function updateStatus(message, type, showInstructions = false, showButtons = false) {
                const statusContainer = document.getElementById('statusContainer');
                const statusMessage = document.getElementById('statusMessage');
                const instructions = document.getElementById('instructions');
                const buttons = document.getElementById('buttons');
                
                statusContainer.className = 'status ' + type;
                statusMessage.textContent = message;
                instructions.style.display = showInstructions ? 'block' : 'none';
                buttons.style.display = showButtons ? 'block' : 'none';
                
                // Remover spinner se não for loading
                if (type !== 'loading') {
                    const spinner = statusContainer.querySelector('.spinner');
                    if (spinner) spinner.remove();
                }
            }
            
            function checkServerStatus() {
                updateStatus('Verificando status do servidor...', 'loading', false, false);
                ipcRenderer.invoke('check-server-status').then(result => {
                    if (result.status === 'running') {
                        updateStatus('Servidor ativo! Carregando projeto...', 'success', false, false);
                        // Carregar o projeto
                        setTimeout(() => {
                            window.location.href = 'http://localhost:9000';
                        }, 1000);
                    } else {
                        updateStatus('Servidor não está ativo. Inicie o servidor através do menu do tray.', 'warning', true, true);
                    }
                }).catch(error => {
                    updateStatus('Erro ao verificar status do servidor: ' + error.message, 'warning', true, true);
                });
            }
            
            // Verificar status automaticamente a cada 2 segundos
            checkServerStatus();
            setInterval(checkServerStatus, 2000);
            
            // Escutar eventos de mudança de status do servidor
            ipcRenderer.on('server-status-changed', (event, data) => {
                if (data.status === 'started') {
                    updateStatus('Servidor iniciado! Carregando projeto...', 'success', false, false);
                    setTimeout(() => {
                        window.location.href = 'http://localhost:9000';
                    }, 1000);
                } else if (data.status === 'stopped') {
                    updateStatus('Servidor parado. Inicie o servidor através do menu do tray.', 'warning', true, true);
                }
            });
        </script>
    </body>
    </html>`;
    
    loadSystemHTML(mainWindow, 'initial.html', fallbackHTML);
    Log.info('Página inicial carregada');
}

// Função para atualizar a janela principal com o projeto
function updateMainWindow() {
    if (mainWindow && apiServer) {
        // Enviar evento para a página inicial atualizar automaticamente
        Log.info('Enviando evento server-status-changed para a janela principal');
        mainWindow.webContents.send('server-status-changed', { status: 'started' });
    }
}

// Função para criar a janela de configuração
function createConfigWindow() {
    if (configWindow) {
        configWindow.show();
        configWindow.focus();
        return;
    }

    try {
        Log.info('Criando janela de configuração...');
        
        // Verificar se o ícone existe
        let iconPath = path.join(__dirname, 'build', 'icon.ico');
        if (!fs.existsSync(iconPath)) {
            Log.warning('Ícone da janela não encontrado, tentando alternativas...');
            iconPath = path.join(process.resourcesPath, 'build', 'icon.ico');
            if (!fs.existsSync(iconPath)) {
                Log.warning('Ícone não encontrado, usando ícone padrão');
                iconPath = null;
            }
        }
        
        configWindow = new BrowserWindow({
            width: 800,
            height: 600,
            icon: iconPath,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        Log.info('Janela de configuração criada com sucesso');

        // Desabilitar o menu completamente
        configWindow.setMenu(null);

        // Carregar arquivo de configuração
        const fallbackHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Erro - FWE Framework</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 600px; margin: 0 auto; }
                .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Erro: Arquivo não encontrado</h1>
                <div class="error">
                    <p>config.html não foi encontrado.</p>
                </div>
            </div>
        </body>
        </html>`;
        
        loadSystemHTML(configWindow, 'config.html', fallbackHTML);

        // Interceptar o fechamento da janela para fechar completamente
        configWindow.on('close', (event) => {
            configWindow = null;
        });
        
        // Em desenvolvimento, abrir DevTools
        if (process.argv.includes('--dev')) {
            configWindow.webContents.openDevTools();
        }

        configWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            Log.error('Falha ao carregar a janela de configuração', { errorCode, errorDescription });
            // Carregar página de erro do sistema
            loadSystemHTML(configWindow, 'config-error.html');
        });

        // Interceptar abertura de novas janelas na janela de configuração
        configWindow.webContents.setWindowOpenHandler(({ url }) => {
            if (SECURITY_CONFIG.allowNewWindows) {
                Log.info('Abertura de nova janela permitida na configuração:', url);
                return { action: 'allow' };
            } else {
                Log.info('Tentativa de abrir nova janela bloqueada na configuração:', url);
                return { action: 'deny' };
            }
        });

        // Interceptar navegação na janela de configuração
        configWindow.webContents.on('will-navigate', (event, navigationUrl) => {
            const isAllowed = SECURITY_CONFIG.allowedDomains.some(domain => navigationUrl.startsWith(domain));
            
            if (!isAllowed) {
                Log.info('Navegação bloqueada na configuração para URL externa:', navigationUrl);
                event.preventDefault();
            }
        });

    } catch (error) {
        Log.error('Erro ao criar janela de configuração', { error: error.message, stack: error.stack });
    }
}

// Função para criar o tray
function createTray() {
    try {
        Log.info('Criando tray...');
        
        // Criar o ícone do tray - tentar diferentes caminhos
        let iconPath = path.join(__dirname, 'build', 'icon.ico');
        Log.info('Tentando caminho do ícone do tray:', iconPath);
        
        // Se não existir, tentar caminhos alternativos
        if (!fs.existsSync(iconPath)) {
            Log.warning('Ícone não encontrado no caminho padrão, tentando alternativas...');
            
            // Tentar caminho relativo
            iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
            if (!fs.existsSync(iconPath)) {
                // Tentar caminho absoluto
                iconPath = path.join(process.resourcesPath, 'build', 'icon.ico');
                                 if (!fs.existsSync(iconPath)) {
                     // Usar ícone padrão do sistema
                     Log.warning('Nenhum ícone encontrado, usando ícone padrão');
                     // Criar um ícone padrão simples
                     const { nativeImage } = require('electron');
                     const defaultIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
                     tray = new Tray(defaultIcon);
                 } else {
                    Log.info('Ícone encontrado em resources:', iconPath);
                    tray = new Tray(iconPath);
                }
            } else {
                Log.info('Ícone encontrado em caminho relativo:', iconPath);
                tray = new Tray(iconPath);
            }
        } else {
            Log.info('Ícone encontrado no caminho padrão:', iconPath);
            tray = new Tray(iconPath);
        }
        
        if (tray) {
            tray.setToolTip('fwe - Framework');
            Log.info('Tray criado com sucesso');
        } else {
            Log.error('Falha ao criar tray - objeto tray é null');
            return;
        }
    } catch (error) {
        Log.error('Erro ao criar tray', { error: error.message, stack: error.stack });
        // Tentar criar tray sem ícone
        try {
            const { nativeImage } = require('electron');
            const defaultIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            tray = new Tray(defaultIcon);
            tray.setToolTip('fwe - Framework');
            Log.info('Tray criado sem ícone como fallback');
        } catch (fallbackError) {
            Log.error('Erro crítico ao criar tray', { error: fallbackError.message });
            tray = null;
        }
    }

    // Criar o menu do tray apenas se o tray foi criado com sucesso
    if (tray) {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Abrir Aplicação',
                click: () => {
                    if (mainWindow) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            },
            {
                label: 'Configuração',
                click: () => {
                    createConfigWindow();
                }
            },
            {
                label: 'Servidor',
                submenu: [
                        {
                            label: apiServer ? 'Parar Servidor' : 'Iniciar Servidor',
                            click: async () => {
                                if (apiServer) {
                                    await stopServer();
                                    // Se a janela principal estiver mostrando o projeto, voltar para a página inicial
                                    if (mainWindow && mainWindow.webContents.getURL().includes('localhost:9000')) {
                                        Log.info('Servidor parado via tray, voltando para página inicial');
                                        loadInitialPage();
                                    }
                                } else {
                                    await startServer();
                                    updateMainWindow();
                                }
                                updateTrayMenu();
                            }
                        }
                ]
            },
            {
                label: 'Backup do Banco',
                click: async () => {
                    try {
                        const result = await backupDatabase();
                        if (result.status === 'success') {
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'Backup Concluído',
                                message: 'Backup do banco de dados criado com sucesso!',
                                detail: `Arquivo: ${result.path}`
                            });
                        } else {
                            dialog.showErrorBox('Erro no Backup', result.message);
                        }
                    } catch (error) {
                        dialog.showErrorBox('Erro no Backup', error.message);
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Sair',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setContextMenu(contextMenu);

        // Clique duplo no tray para abrir a aplicação
        tray.on('double-click', () => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
        
        Log.info('Menu do tray configurado com sucesso');
    } else {
        Log.warning('Tray não disponível, pulando configuração do menu');
    }
}

// Função para atualizar o menu do tray
function updateTrayMenu() {
    if (tray) {
        try {
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: 'Abrir Aplicação',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.show();
                            mainWindow.focus();
                        }
                    }
                },
                {
                    label: 'Configuração',
                    click: () => {
                        createConfigWindow();
                    }
                },
                {
                    label: 'Servidor',
                    submenu: [
                        {
                            label: apiServer ? 'Parar Servidor' : 'Iniciar Servidor',
                            click: async () => {
                                if (apiServer) {
                                    await stopServer();
                                    // Se a janela principal estiver mostrando o projeto, voltar para a página inicial
                                    if (mainWindow && mainWindow.webContents.getURL().includes('localhost:9000')) {
                                        Log.info('Servidor parado via tray, voltando para página inicial');
                                        loadInitialPage();
                                    }
                                } else {
                                    await startServer();
                                    updateMainWindow();
                                }
                                updateTrayMenu();
                            }
                        }
                    ]
                },
                {
                    label: 'Backup do Banco',
                    click: async () => {
                        try {
                            const result = await backupDatabase();
                            if (result.status === 'success') {
                                dialog.showMessageBox(mainWindow, {
                                    type: 'info',
                                    title: 'Backup Concluído',
                                    message: 'Backup do banco de dados criado com sucesso!',
                                    detail: `Arquivo: ${result.path}`
                                });
                            } else {
                                dialog.showErrorBox('Erro no Backup', result.message);
                            }
                        } catch (error) {
                            dialog.showErrorBox('Erro no Backup', error.message);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    click: () => {
                        isQuitting = true;
                        app.quit();
                    }
                }
            ]);

            tray.setContextMenu(contextMenu);
            Log.info('Menu do tray atualizado com sucesso');
        } catch (error) {
            Log.error('Erro ao atualizar menu do tray', { error: error.message });
        }
    } else {
        Log.warning('Tray não disponível para atualização do menu');
    }
}

// Função para salvar configurações
function saveConfig() {
    const configPath = path.join(os.homedir(), 'fwe', 'config.ini');
    fs.writeFileSync(configPath, ini.stringify(config));
    Log.info('Configurações salvas', { configPath });
}

// Função para inicializar toda a aplicação
async function initializeApp() {
    try {
        Log.info('Iniciando inicialização da aplicação...');
        
        Log.info('Inicializando configurações...');
        initializeConfig();
        
        Log.info('Conectando ao banco de dados...');
        const Database = require('./App/Helpers/Database');
        await Database.connect();
        
        Log.info('Executando migrations...');
        await Database.runMigrations();
        
        Log.info('Criando janela principal...');
        createWindow();
        
        Log.info('Aplicação Electron iniciada com sucesso');
    } catch (error) {
        Log.error('Erro durante inicialização da aplicação', { error: error.message, stack: error.stack });
        throw error;
    }
}

// Verificar se já existe uma instância rodando
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    Log.warning('Outra instância da aplicação já está rodando');
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        Log.info('Segunda instância detectada, focando janela principal');
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            mainWindow.show();
        }
    });

    // Eventos do Electron
    app.whenReady().then(() => {
        try {
            Log.info('Iniciando aplicação Electron...');
            initializeApp();
        } catch (err) {
            Log.error('Erro ao inicializar a aplicação Electron', { error: err.message, stack: err.stack });
            // Em caso de erro, tentar criar a janela mesmo assim
            try {
                createWindow();
            } catch (windowErr) {
                Log.error('Erro crítico ao criar janela', { error: windowErr.message });
            }
        }
        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        Log.info('Aplicação Electron finalizada');
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
    if (tray) {
        tray.destroy();
    }
});

// IPC Handlers
ipcMain.handle('get-config', () => {
    // Carregar configurações do arquivo do usuário (onde o sistema realmente lê)
    try {
        const userHome = os.homedir();
        const configDir = path.join(userHome, 'fwe');
        const configPath = path.join(configDir, 'config.ini');
        
        if (fs.existsSync(configPath)) {
            const iniConfig = ini.parse(fs.readFileSync(configPath, 'utf-8'));
            return parseFlatConfig(iniConfig);
        } else {
            // Se não existir, retornar configurações padrão
            return {
                database: {
                    driver: 'sqlite',
                    sqlite: {
                        path: path.join(configDir, 'database.sqlite')
                    },
                    mysql: {
                        host: 'localhost',
                        user: 'root',
                        password: '',
                        database: 'fwe',
                        port: 3306,
                        charset: 'utf8mb4'
                    }
                },
                server: {
                    port: 9000,
                    cors: true,
                    autostart: false,
                    baseUrl: 'http://localhost:9000'
                },
                logging: {
                    console: false,
                    file: true,
                    path: path.join(configDir, 'logs')
                }
            };
        }
    } catch (error) {
        Log.error('Erro ao carregar configurações do usuário:', error.message);
        return config; // Fallback para config local
    }
});

// Função para converter configuração aninhada em formato INI
function parseFlatConfig(flat) {
    const result = {};
    for (const key in flat) {
        const value = flat[key];
        const keys = key.split('.');
        let current = result;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (i === keys.length - 1) {
                current[k] = value;
            } else {
                if (!current[k]) current[k] = {};
                current = current[k];
            }
        }
    }
    return result;
}

// Handler para salvar configurações
ipcMain.handle('save-config', (event, newConfig) => {
    try {
        // Salvar no arquivo do usuário (onde o sistema realmente lê)
        const userHome = os.homedir();
        const configDir = path.join(userHome, 'fwe');
        const configPath = path.join(configDir, 'config.ini');
        
        // Criar diretório se não existir
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        // Criar objeto de configuração no formato de seções INI
        const configObject = {
            database: {
                driver: newConfig.database?.driver || 'sqlite'
            },
            server: {
                port: newConfig.server?.port || 9000,
                cors: newConfig.server?.cors ? 'true' : 'false',
                autostart: newConfig.server?.autostart ? 'true' : 'false',
                baseUrl: newConfig.server?.baseUrl || 'http://localhost:9000'
            },
            logging: {
                console: newConfig.logging?.console ? 'true' : 'false',
                file: newConfig.logging?.file ? 'true' : 'false',
                path: newConfig.logging?.path || path.join(configDir, 'logs'),
                maxline: '1024'
            },
            jwt: {
                secret: 'your-secret-key',
                expiresIn: '24h'
            }
        };
        
        // Adicionar configurações específicas do banco
        if (newConfig.database?.driver === 'sqlite' && newConfig.database?.sqlite) {
            configObject['database.sqlite'] = {
                path: newConfig.database.sqlite.path,
                charset: 'utf8'
            };
        } else if (newConfig.database?.driver === 'mysql' && newConfig.database?.mysql) {
            configObject['database.mysql'] = {
                host: newConfig.database.mysql.host || 'localhost',
                user: newConfig.database.mysql.user || 'root',
                password: newConfig.database.mysql.password || '',
                database: newConfig.database.mysql.database || 'fwe',
                port: newConfig.database.mysql.port || 3306,
                charset: newConfig.database.mysql.charset || 'utf8mb4'
            };
        }
        
        // Escrever arquivo manualmente para evitar escape de pontos
        let iniContent = '';
        
        // Seção [database]
        if (configObject.database) {
            iniContent += '[database]\n';
            iniContent += `driver=${configObject.database.driver}\n\n`;
        }
        
        // Seção [database.sqlite]
        if (configObject['database.sqlite']) {
            iniContent += '[database.sqlite]\n';
            iniContent += `path=${configObject['database.sqlite'].path}\n`;
            iniContent += `charset=${configObject['database.sqlite'].charset}\n\n`;
        }
        
        // Seção [database.mysql]
        if (configObject['database.mysql']) {
            iniContent += '[database.mysql]\n';
            iniContent += `host=${configObject['database.mysql'].host}\n`;
            iniContent += `user=${configObject['database.mysql'].user}\n`;
            iniContent += `password=${configObject['database.mysql'].password}\n`;
            iniContent += `database=${configObject['database.mysql'].database}\n`;
            iniContent += `port=${configObject['database.mysql'].port}\n`;
            iniContent += `charset=${configObject['database.mysql'].charset}\n\n`;
        }
        
        // Seção [server]
        if (configObject.server) {
            iniContent += '[server]\n';
            iniContent += `port=${configObject.server.port}\n`;
            iniContent += `cors=${configObject.server.cors}\n`;
            iniContent += `autostart=${configObject.server.autostart}\n`;
            iniContent += `baseUrl=${configObject.server.baseUrl}\n\n`;
        }
        
        // Seção [logging]
        if (configObject.logging) {
            iniContent += '[logging]\n';
            iniContent += `console=${configObject.logging.console}\n`;
            iniContent += `file=${configObject.logging.file}\n`;
            iniContent += `path=${configObject.logging.path}\n`;
            iniContent += `maxline=${configObject.logging.maxline}\n\n`;
        }
        
        // Seção [jwt]
        if (configObject.jwt) {
            iniContent += '[jwt]\n';
            iniContent += `secret=${configObject.jwt.secret}\n`;
            iniContent += `expiresIn=${configObject.jwt.expiresIn}\n\n`;
        }
        
        // Escrever arquivo
        fs.writeFileSync(configPath, iniContent, 'utf8');
        
        Log.info('Configurações salvas com sucesso no config.ini');
        return { success: true, message: 'Configurações salvas com sucesso' };
        
    } catch (error) {
        Log.error('Erro ao salvar configurações:', error.message);
        return { success: false, message: error.message };
    }
});

// Função auxiliar para iniciar servidor
async function startServer() {
    if (!apiServer) {
        try {
            const { startServer } = require('./App/Libraries/Server');
            apiServer = await startServer(config);
            
            // Atualizar configuração para autostart
            config.server.autostart = true;
            saveConfig();
            
            Log.info('Servidor iniciado', { port: config.server.port });
            return { status: 'started' };
        } catch (error) {
            Log.error('Erro ao iniciar servidor', { error: error.message });
            throw error;
        }
    }
    return { status: 'already-running' };
}

// Função auxiliar para parar servidor
async function stopServer() {
    if (apiServer) {
        try {
            await apiServer.close();
            apiServer = null;
            
            // Atualizar configuração para não autostart
            config.server.autostart = false;
            saveConfig();
            
            // Notificar a interface que o servidor foi parado
            if (mainWindow) {
                mainWindow.webContents.send('server-status-changed', { status: 'stopped' });
            }
            
            Log.info('Servidor parado');
            return { status: 'stopped' };
        } catch (error) {
            Log.error('Erro ao parar servidor', { error: error.message });
            throw error;
        }
    }
    return { status: 'not-running' };
}

ipcMain.handle('start-server', async () => {
    const result = await startServer();
    updateTrayMenu();
    updateMainWindow();
    return result;
});

ipcMain.handle('stop-server', async () => {
    const result = await stopServer();
    updateTrayMenu();
    
    // Se a janela principal estiver mostrando o projeto, voltar para a página inicial
    if (mainWindow && mainWindow.webContents.getURL().includes('localhost:9000')) {
        Log.info('Servidor parado, voltando para página inicial');
        loadInitialPage();
    }
    
    return result;
});

ipcMain.handle('minimize-to-tray', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
    return { status: 'minimized' };
});

ipcMain.handle('check-server-status', () => {
    if (apiServer) {
        return { status: 'running', port: config.server.port };
    } else {
        return { status: 'stopped' };
    }
});

ipcMain.handle('get-security-config', () => {
    return SECURITY_CONFIG;
});

ipcMain.handle('set-security-config', (event, newConfig) => {
    if (newConfig.allowNewWindows !== undefined) {
        SECURITY_CONFIG.allowNewWindows = newConfig.allowNewWindows;
    }
    if (newConfig.allowedDomains) {
        SECURITY_CONFIG.allowedDomains = newConfig.allowedDomains;
    }
    Log.info('Configuração de segurança atualizada:', SECURITY_CONFIG);
    return SECURITY_CONFIG;
});

ipcMain.handle('backup-database', async () => {
    try {
        const backupDir = path.join(os.homedir(), 'fwe', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

        if (config.database.driver === 'sqlite') {
            fs.copyFileSync(config.database.sqlite.path, backupPath);
            Log.info('Backup do banco de dados criado', { backupPath });
            return { status: 'success', path: backupPath };
        }
        
        Log.warning('Backup solicitado para driver não suportado', { driver: config.database.driver });
        return { status: 'error', message: 'Backup only supported for SQLite' };
    } catch (error) {
        Log.error('Erro ao criar backup do banco de dados', { error: error.message });
        return { status: 'error', message: error.message };
    }
});

// Função auxiliar para backup (usada pelo tray)
async function backupDatabase() {
    try {
        const backupDir = path.join(os.homedir(), 'fwe', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

        if (config.database.driver === 'sqlite') {
            fs.copyFileSync(config.database.sqlite.path, backupPath);
            Log.info('Backup do banco de dados criado', { backupPath });
            return { status: 'success', path: backupPath };
        }
        
        Log.warning('Backup solicitado para driver não suportado', { driver: config.database.driver });
        return { status: 'error', message: 'Backup only supported for SQLite' };
    } catch (error) {
        Log.error('Erro ao criar backup do banco de dados', { error: error.message });
        return { status: 'error', message: error.message };
    }
} 