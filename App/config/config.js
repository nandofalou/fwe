const path = require('path');
const os = require('os');
const fs = require('fs');
const ini = require('ini');

class Config {
    constructor() {
        this.config = this.loadConfig();
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
                        path: './database.sqlite',
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
        return ini.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    get database() {
        return this.config.database;
    }

    get server() {
        return this.config.server;
    }

    get jwt() {
        return this.config.jwt;
    }

    get all() {
        return this.config;
    }
}

module.exports = new Config(); 