const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const os = require('os');
const Log = require('./App/Helpers/Log');

// Configurações globais
let mainWindow;
let apiServer = null;
let config = null;
let tray = null;
let isQuitting = false;

// Função para criar a janela principal
function createWindow() {
    try {
        Log.info('Criando janela principal...');
        
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            icon: path.join(__dirname, 'build', 'icon.ico'),
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

        const htmlPath = path.join(__dirname, 'Public', 'config.html');
        Log.info('Carregando arquivo HTML:', htmlPath);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(htmlPath)) {
            Log.error('Arquivo HTML não encontrado:', htmlPath);
            const errorPath = path.join(__dirname, 'Public', 'error.html');
            if (fs.existsSync(errorPath)) {
                Log.info('Carregando página de erro');
                mainWindow.loadFile(errorPath);
            } else {
                Log.error('Página de erro também não encontrada');
                // Criar uma página de erro básica
                mainWindow.loadURL('data:text/html,<h1>Erro: Arquivo não encontrado</h1><p>config.html não foi encontrado.</p>');
            }
        } else {
            mainWindow.loadFile(htmlPath);
        }

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
            // Tentar carregar página de erro
            try {
                mainWindow.loadFile(path.join(__dirname, 'Public', 'error.html'));
            } catch (loadError) {
                Log.error('Erro ao carregar página de erro', { error: loadError.message });
            }
        });

        mainWindow.webContents.on('did-finish-load', () => {
            Log.info('Arquivo HTML carregado com sucesso');
            if (config && config.server && config.server.autostart) {
                Log.info('Iniciando servidor automaticamente...');
                const { startServer } = require('./App/Libraries/Server');
                startServer(config).then(server => {
                    apiServer = server;
                    Log.info('Servidor iniciado automaticamente');
                    // Notificar a interface que o servidor foi iniciado
                    Log.info('Enviando evento server-status-changed para a interface');
                    mainWindow.webContents.send('server-status-changed', { status: 'started' });
                }).catch(error => {
                    Log.error('Erro ao iniciar servidor automaticamente', { error: error.message });
                });
            } else {
                Log.info('Servidor não configurado para iniciar automaticamente');
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

// Função para criar o tray
function createTray() {
    try {
        Log.info('Criando tray...');
        
        // Criar o ícone do tray
        const iconPath = path.join(__dirname, 'build', 'icon.ico');
        Log.info('Caminho do ícone do tray:', iconPath);
        
        tray = new Tray(iconPath);
        tray.setToolTip('fwe - Framework');
        
        Log.info('Tray criado com sucesso');
    } catch (error) {
        Log.error('Erro ao criar tray', { error: error.message, stack: error.stack });
        // Não lançar erro para não interromper a aplicação
    }

    // Criar o menu do tray
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
            label: 'Servidor',
            submenu: [
                {
                    label: apiServer ? 'Parar Servidor' : 'Iniciar Servidor',
                    click: async () => {
                        if (apiServer) {
                            await stopServer();
                        } else {
                            await startServer();
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
}

// Função para atualizar o menu do tray
function updateTrayMenu() {
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
                label: 'Servidor',
                submenu: [
                    {
                        label: apiServer ? 'Parar Servidor' : 'Iniciar Servidor',
                        click: async () => {
                            if (apiServer) {
                                await stopServer();
                            } else {
                                await startServer();
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

// VERSÃO SEM CONTROLE DE INSTÂNCIA ÚNICA PARA DEBUG
Log.info('Iniciando aplicação em modo debug (sem controle de instância única)');

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
    return config;
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
    return result;
});

ipcMain.handle('stop-server', async () => {
    const result = await stopServer();
    updateTrayMenu();
    return result;
});

ipcMain.handle('minimize-to-tray', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
    return { status: 'minimized' };
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
