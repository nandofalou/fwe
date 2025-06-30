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
                'database.driver': 'sqlite',
                'database.sqlite.path': path.join(configDir, 'database.sqlite'),
                'database.sqlite.charset': 'utf8',
                'database.mysql.host': 'localhost',
                'database.mysql.user': 'root',
                'database.mysql.password': '',
                'database.mysql.database': 'fwe',
                'database.mysql.charset': 'utf8mb4',
                'server.port': 9000,
                'server.cors': true,
                'server.autostart': false,
                'jwt.secret': 'your-secret-key',
                'jwt.expiresIn': '24h',
                'logging.console': true,
                'logging.file': true,
                'logging.path': path.join(configDir, 'logs'),
                'logging.maxline': 1024
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
        return this.config.database;
    }

    get server() {
        return this.config.server;
    }

    get jwt() {
        return this.config.jwt;
    }

    get logging() {
        return this.config.logging;
    }

    get all() {
        return this.config;
    }
}

module.exports = new Config(); 