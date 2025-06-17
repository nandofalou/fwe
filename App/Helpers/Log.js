const fs = require('fs');
const path = require('path');
const os = require('os');
const Event = require('./Event');

/**
 * Níveis de log
 */
const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    FATAL: 'FATAL'
};

/**
 * Cores para cada nível de log
 */
const LogColors = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m', // Green
    WARN: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m', // Red
    FATAL: '\x1b[35m' // Magenta
};

/**
 * Reset de cor
 */
const ResetColor = '\x1b[0m';

/**
 * Obtém o diretório de logs
 * @returns {string} Caminho do diretório
 */
function getLogDir() {
    const logDir = path.join(os.homedir(), 'fwe', 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    return logDir;
}

/**
 * Obtém o nome do arquivo de log
 * @returns {string} Nome do arquivo
 */
function getLogFileName() {
    const date = new Date();
    return `app-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
}

/**
 * Formata uma mensagem de log
 * @param {string} level Nível do log
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 * @returns {string} Mensagem formatada
 */
function formatLogMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
        if (typeof data === 'object') {
            logMessage += `\n${JSON.stringify(data, null, 2)}`;
        } else {
            logMessage += ` ${data}`;
        }
    }
    
    return logMessage;
}

/**
 * Escreve um log no arquivo
 * @param {string} level Nível do log
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function writeLog(level, message, data = null) {
    const logDir = getLogDir();
    const logFile = path.join(logDir, getLogFileName());
    const logMessage = formatLogMessage(level, message, data);
    
    fs.appendFileSync(logFile, logMessage + '\n');
}

/**
 * Escreve um log no console
 * @param {string} level Nível do log
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function writeConsole(level, message, data = null) {
    const logMessage = formatLogMessage(level, message, data);
    console.log(`${LogColors[level]}${logMessage}${ResetColor}`);
}

/**
 * Log de debug
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function debug(message, data = null) {
    writeLog(LogLevel.DEBUG, message, data);
    writeConsole(LogLevel.DEBUG, message, data);
}

/**
 * Log de informação
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function info(message, data = null) {
    writeLog(LogLevel.INFO, message, data);
    writeConsole(LogLevel.INFO, message, data);
}

/**
 * Log de aviso
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function warn(message, data = null) {
    writeLog(LogLevel.WARN, message, data);
    writeConsole(LogLevel.WARN, message, data);
}

/**
 * Log de erro
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function error(message, data = null) {
    writeLog(LogLevel.ERROR, message, data);
    writeConsole(LogLevel.ERROR, message, data);
}

/**
 * Log fatal
 * @param {string} message Mensagem
 * @param {Object} data Dados adicionais
 */
function fatal(message, data = null) {
    writeLog(LogLevel.FATAL, message, data);
    writeConsole(LogLevel.FATAL, message, data);
}

/**
 * Limpa logs antigos
 * @param {number} days Dias para manter
 */
function cleanOldLogs(days = 30) {
    const logDir = getLogDir();
    const files = fs.readdirSync(logDir);
    const now = new Date();
    
    files.forEach(file => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        const fileDate = new Date(stats.mtime);
        const diffDays = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays > days) {
            fs.unlinkSync(filePath);
        }
    });
}

/**
 * Classe para manipulação de log
 */
class Log {
    constructor() {
        this.event = Event;
        this.logs = new Map();
    }

    /**
     * Registra uma mensagem de log
     * @param {string} name Nome do log
     * @param {string} level Nível
     * @param {string} message Mensagem
     * @param {Object} data Dados (opcional)
     */
    log(name, level, message, data = {}) {
        const log = {
            level,
            message,
            data,
            timestamp: Date.now()
        };

        if (!this.logs.has(name)) {
            this.logs.set(name, []);
        }

        this.logs.get(name).push(log);
        this.event.emit('log:created', name, log);
    }

    /**
     * Registra uma mensagem de debug
     * @param {string} name Nome do log
     * @param {string} message Mensagem
     * @param {Object} data Dados (opcional)
     */
    debug(name, message, data = {}) {
        this.log(name, 'debug', message, data);
    }

    /**
     * Registra uma mensagem de informação
     * @param {string} name Nome do log
     * @param {string} message Mensagem
     * @param {Object} data Dados (opcional)
     */
    info(name, message, data = {}) {
        this.log(name, 'info', message, data);
    }

    /**
     * Registra uma mensagem de aviso
     * @param {string} name Nome do log
     * @param {string} message Mensagem
     * @param {Object} data Dados (opcional)
     */
    warn(name, message, data = {}) {
        this.log(name, 'warn', message, data);
    }

    /**
     * Registra uma mensagem de erro
     * @param {string} name Nome do log
     * @param {string} message Mensagem
     * @param {Object} data Dados (opcional)
     */
    error(name, message, data = {}) {
        this.log(name, 'error', message, data);
    }

    /**
     * Registra uma mensagem fatal
     * @param {string} name Nome do log
     * @param {string} message Mensagem
     * @param {Object} data Dados (opcional)
     */
    fatal(name, message, data = {}) {
        this.log(name, 'fatal', message, data);
    }

    /**
     * Obtém os logs
     * @param {string} name Nome do log
     * @returns {Array} Logs
     */
    get(name) {
        return this.logs.get(name) || [];
    }

    /**
     * Limpa os logs
     * @param {string} name Nome do log
     */
    clear(name) {
        this.logs.delete(name);
        this.event.emit('log:cleared', name);
    }

    /**
     * Salva os logs em um arquivo
     * @param {string} name Nome do log
     * @param {string} file Caminho do arquivo
     */
    save(name, file) {
        const logs = this.get(name);
        const data = JSON.stringify(logs, null, 2);

        fs.writeFile(file, data, (err) => {
            if (err) {
                this.event.emit('log:error', err);
                throw err;
            }
            this.event.emit('log:saved', name, file);
        });
    }

    /**
     * Carrega os logs de um arquivo
     * @param {string} name Nome do log
     * @param {string} file Caminho do arquivo
     */
    load(name, file) {
        fs.readFile(file, (err, data) => {
            if (err) {
                this.event.emit('log:error', err);
                throw err;
            }

            const logs = JSON.parse(data);
            this.logs.set(name, logs);
            this.event.emit('log:loaded', name, file);
        });
    }

    /**
     * Filtra os logs
     * @param {string} name Nome do log
     * @param {Object} filter Filtro
     * @returns {Array} Logs filtrados
     */
    filter(name, filter) {
        const logs = this.get(name);

        return logs.filter(log => {
            for (const [key, value] of Object.entries(filter)) {
                if (log[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Agrupa os logs
     * @param {string} name Nome do log
     * @param {string} key Chave
     * @returns {Object} Logs agrupados
     */
    group(name, key) {
        const logs = this.get(name);
        const groups = {};

        for (const log of logs) {
            const value = log[key];
            if (!groups[value]) {
                groups[value] = [];
            }
            groups[value].push(log);
        }

        return groups;
    }

    /**
     * Conta os logs
     * @param {string} name Nome do log
     * @param {string} key Chave
     * @returns {Object} Contagem
     */
    count(name, key) {
        const logs = this.get(name);
        const counts = {};

        for (const log of logs) {
            const value = log[key];
            counts[value] = (counts[value] || 0) + 1;
        }

        return counts;
    }

    /**
     * Obtém os logs por nível
     * @param {string} name Nome do log
     * @param {string} level Nível
     * @returns {Array} Logs
     */
    getByLevel(name, level) {
        return this.filter(name, { level });
    }

    /**
     * Obtém os logs por período
     * @param {string} name Nome do log
     * @param {number} start Início
     * @param {number} end Fim
     * @returns {Array} Logs
     */
    getByPeriod(name, start, end) {
        const logs = this.get(name);

        return logs.filter(log => {
            const timestamp = log.timestamp;
            return timestamp >= start && timestamp <= end;
        });
    }

    /**
     * Obtém os logs por mensagem
     * @param {string} name Nome do log
     * @param {string} message Mensagem
     * @returns {Array} Logs
     */
    getByMessage(name, message) {
        const logs = this.get(name);

        return logs.filter(log => {
            return log.message.includes(message);
        });
    }

    /**
     * Obtém os logs por dados
     * @param {string} name Nome do log
     * @param {Object} data Dados
     * @returns {Array} Logs
     */
    getByData(name, data) {
        const logs = this.get(name);

        return logs.filter(log => {
            for (const [key, value] of Object.entries(data)) {
                if (log.data[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Obtém os logs mais recentes
     * @param {string} name Nome do log
     * @param {number} limit Limite
     * @returns {Array} Logs
     */
    getLatest(name, limit = 10) {
        const logs = this.get(name);

        return logs.slice(-limit);
    }

    /**
     * Obtém os logs mais antigos
     * @param {string} name Nome do log
     * @param {number} limit Limite
     * @returns {Array} Logs
     */
    getOldest(name, limit = 10) {
        const logs = this.get(name);

        return logs.slice(0, limit);
    }
}

module.exports = new Log(); 