const fs = require('fs');
const path = require('path');
const Config = require('../config/config');

class Log {
    constructor() {
        this.config = Config;
        this.logPath = this.config.logging?.path || './logs';
        this.consoleEnabled = this.config.logging?.console !== false;
        this.fileEnabled = this.config.logging?.file === true;
        this.maxline = parseInt(this.config.logging?.maxline, 10);
        if (isNaN(this.maxline) || this.maxline <= 0) this.maxline = null;
        
        this.ensureLogDirectory();
    }

    /**
     * Garante que o diretório de logs existe
     */
    ensureLogDirectory() {
        if (this.fileEnabled && !fs.existsSync(this.logPath)) {
            try {
                fs.mkdirSync(this.logPath, { recursive: true });
                console.log(`Diretório de logs criado: ${this.logPath}`);
            } catch (error) {
                console.error('Erro ao criar diretório de logs:', error);
            }
        }
    }

    /**
     * Formata a mensagem de log com timestamp
     * @param {string} level Nível do log (INFO, ERROR, WARNING)
     * @param {string} message Mensagem
     * @param {Object} data Dados adicionais (opcional)
     * @returns {string} Mensagem formatada
     */
    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let formattedMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (data) {
            if (typeof data === 'object') {
                formattedMessage += ` | Data: ${JSON.stringify(data)}`;
            } else {
                formattedMessage += ` | Data: ${data}`;
            }
        }
        
        return formattedMessage;
    }

    /**
     * Escreve no arquivo de log
     * @param {string} filename Nome do arquivo
     * @param {string} message Mensagem formatada
     */
    writeToFile(filename, message) {
        if (!this.fileEnabled) return;

        const filePath = path.join(this.logPath, filename);
        let lines = [];
        if (fs.existsSync(filePath)) {
            lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
        }
        // Se maxline está definido e já atingiu o limite, remove a linha mais antiga
        if (this.maxline && lines.length >= this.maxline) {
            lines = lines.slice(lines.length - this.maxline + 1);
        }
        lines.push(message);
        
        try {
            fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
        } catch (error) {
            // Se falhar ao escrever no arquivo, pelo menos exibe no console
            console.error('Erro ao escrever no arquivo de log:', error);
        }
    }

    /**
     * Log de informação
     * @param {string} message Mensagem
     * @param {Object} data Dados adicionais (opcional)
     */
    info(message, data = null) {
        const formattedMessage = this.formatMessage('INFO', message, data);
        
        if (this.consoleEnabled) {
            console.log(formattedMessage);
        }
        
        this.writeToFile('log.txt', formattedMessage);
    }

    /**
     * Log de erro
     * @param {string} message Mensagem
     * @param {Object} data Dados adicionais (opcional)
     */
    error(message, data = null) {
        const formattedMessage = this.formatMessage('ERROR', message, data);
        
        if (this.consoleEnabled) {
            console.error(formattedMessage);
        }
        
        this.writeToFile('error.txt', formattedMessage);
    }

    /**
     * Log de aviso
     * @param {string} message Mensagem
     * @param {Object} data Dados adicionais (opcional)
     */
    warning(message, data = null) {
        const formattedMessage = this.formatMessage('WARNING', message, data);
        
        if (this.consoleEnabled) {
            console.warn(formattedMessage);
        }
        
        this.writeToFile('warning.txt', formattedMessage);
    }

    /**
     * Log de debug (só aparece se console estiver habilitado)
     * @param {string} message Mensagem
     * @param {Object} data Dados adicionais (opcional)
     */
    debug(message, data = null) {
        const formattedMessage = this.formatMessage('DEBUG', message, data);
        
        if (this.consoleEnabled) {
            console.debug(formattedMessage);
        }
        
        // Debug não vai para arquivo por padrão
    }

    /**
     * Limpa arquivos de log antigos (mais de X dias)
     * @param {number} days Número de dias para manter
     */
    cleanOldLogs(days = 30) {
        if (!this.fileEnabled) return;

        const files = ['log.txt', 'error.txt', 'warning.txt'];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        files.forEach(filename => {
            const filePath = path.join(this.logPath, filename);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.mtime < cutoffDate) {
                    try {
                        fs.unlinkSync(filePath);
                        this.info(`Arquivo de log antigo removido: ${filename}`);
                    } catch (error) {
                        this.error(`Erro ao remover arquivo de log antigo: ${filename}`, error);
                    }
                }
            }
        });
    }
}

module.exports = new Log(); 