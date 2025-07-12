const path = require('path');
const os = require('os');
const fs = require('fs');
const ini = require('ini');

class Config {
    constructor() {
        this.Config = this.loadConfig();
    }

    loadConfig() {
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
                    port: 9000,
                    cors: true,
                    autostart: false,
                    baseUrl: 'http://localhost:9000'
                },
                jwt: {
                    secret: 'your-secret-key',
                    expiresIn: '24h'
                },
                logging: {
                    console: false,
                    file: true,
                    path: path.join(configDir, 'logs'),
                    maxline: 1024
                }
            };
            fs.writeFileSync(configPath, ini.stringify(defaultConfig));
        }

        // Carregar configurações
        const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
        return this.parseFlatConfig(config);
    }

    // Converte um objeto plano com chaves "a.b.c" em objeto aninhado
    parseFlatConfig(flat) {
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

    get database() {
        return this.Config && this.Config.database ? this.Config.database : {};
    }

    get server() {
        return this.Config.server;
    }

    get jwt() {
        return this.Config.jwt;
    }

    get logging() {
        return this.Config.logging;
    }

    get all() {
        return this.Config;
    }
}

let baseURL = '';
try {
    const configPath = path.join(__dirname, '../../config.ini');
    let iniConfig = {};
    if (fs.existsSync(configPath)) {
        iniConfig = ini.parse(fs.readFileSync(configPath, 'utf-8'));
        baseURL = iniConfig.app && iniConfig.app.baseURL ? iniConfig.app.baseURL : '';
    }
    if (!baseURL) {
        // Gerar valor padrão
        let port = 9000;
        if (iniConfig.server && iniConfig.server.port) {
            port = iniConfig.server.port;
        }
        baseURL = `http://localhost:${port}`;
        // Gravar no config.ini
        if (!iniConfig.app) iniConfig.app = {};
        iniConfig.app.baseURL = baseURL;
        fs.writeFileSync(configPath, ini.stringify(iniConfig));
    }
} catch (e) {
    baseURL = '';
}

const configInstance = new Config();
configInstance.baseURL = baseURL;
module.exports = configInstance; 