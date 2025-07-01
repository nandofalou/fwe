const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const os = require('os');
const Log = require('./App/Helpers/Log');

// Configurações globais
let mainWindow;
let apiServer = null;
let config = null;

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('Public/index.html');
    
    // Em desenvolvimento, abrir DevTools
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    // Iniciar servidor automaticamente após a janela estar carregada
    mainWindow.webContents.on('did-finish-load', () => {
        if (config.server.autostart) {
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

// Função para salvar configurações
function saveConfig() {
    const configPath = path.join(os.homedir(), 'fwe', 'config.ini');
    fs.writeFileSync(configPath, ini.stringify(config));
    Log.info('Configurações salvas', { configPath });
}

// Função para inicializar toda a aplicação
async function initializeApp() {
    initializeConfig();
    const Database = require('./App/Helpers/Database');
    await Database.connect();
    await Database.runMigrations();
    createWindow();
    Log.info('Aplicação Electron iniciada');
}

// Eventos do Electron
app.whenReady().then(() => {
    initializeApp();
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

// IPC Handlers
ipcMain.handle('get-config', () => {
    return config;
});

ipcMain.handle('start-server', async () => {
    if (!apiServer) {
        try {
            const { startServer } = require('./App/Libraries/Server');
            apiServer = await startServer(config);
            
            // Atualizar configuração para autostart
            config.server.autostart = true;
            saveConfig();
            
            Log.info('Servidor iniciado via interface', { port: config.server.port });
            return { status: 'started' };
        } catch (error) {
            Log.error('Erro ao iniciar servidor via interface', { error: error.message });
            throw error;
        }
    }
    return { status: 'already-running' };
});

ipcMain.handle('stop-server', async () => {
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
            
            Log.info('Servidor parado via interface');
            return { status: 'stopped' };
        } catch (error) {
            Log.error('Erro ao parar servidor via interface', { error: error.message });
            throw error;
        }
    }
    return { status: 'not-running' };
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