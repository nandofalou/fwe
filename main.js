const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const os = require('os');

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
                cors: true
            },
            jwt: {
                secret: 'your-secret-key',
                expiresIn: '24h'
            }
        };

        fs.writeFileSync(configPath, ini.stringify(defaultConfig));
    }

    // Carregar configurações
    config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
}

// Eventos do Electron
app.whenReady().then(() => {
    initializeConfig();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('get-config', () => {
    return config;
});

ipcMain.handle('start-server', async () => {
    if (!apiServer) {
        const { startServer } = require('./App/Libraries/Server');
        apiServer = await startServer(config);
        return { status: 'started' };
    }
    return { status: 'already-running' };
});

ipcMain.handle('stop-server', async () => {
    if (apiServer) {
        await apiServer.close();
        apiServer = null;
        return { status: 'stopped' };
    }
    return { status: 'not-running' };
});

ipcMain.handle('backup-database', async () => {
    const backupDir = path.join(os.homedir(), 'fwe', 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

    if (config.database.driver === 'sqlite') {
        fs.copyFileSync(config.database.sqlite.path, backupPath);
        return { status: 'success', path: backupPath };
    }
    
    return { status: 'error', message: 'Backup only supported for SQLite' };
}); 