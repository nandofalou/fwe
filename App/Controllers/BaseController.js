const Log = require('../Helpers/Log');
const path = require('path');
const ejs = require('ejs');
const { base_url } = require('../Helpers/Common');
const { resolveAppPath } = require('../Helpers/Path');

class BaseController {
    constructor(model) {
        this.model = model;
    }

    /**
     * Carrega todos os helpers disponíveis na pasta Helpers
     * @returns {Object} Objeto com todos os helpers
     */
    static loadHelpers() {
        const fs = require('fs');
        const helpersPath = path.join(__dirname, '..', 'Helpers');
        const helpers = {};

        try {
            const files = fs.readdirSync(helpersPath);
            
            files.forEach(file => {
                if (file.endsWith('.js') && file !== 'index.js') {
                    const helperName = file.replace('.js', '');
                    try {
                        const helperModule = require(path.join(helpersPath, file));
                        
                        // Se o helper exporta um objeto com múltiplas funções
                        if (typeof helperModule === 'object' && helperModule !== null) {
                            Object.keys(helperModule).forEach(key => {
                                // Prefixa com 'helper_' para evitar conflitos
                                helpers[`helper_${key}`] = helperModule[key];
                            });
                        } else {
                            // Se o helper exporta uma função diretamente
                            helpers[`helper_${helperName}`] = helperModule;
                        }
                    } catch (error) {
                        console.warn(`Erro ao carregar helper ${file}:`, error.message);
                    }
                }
            });
        } catch (error) {
            console.warn('Erro ao carregar helpers:', error.message);
        }

        return helpers;
    }

    /**
     * Métodos estáticos de logging para uso em controllers
     */
    static log = {
        info: (message, data = null) => Log.info(message, data),
        error: (message, data = null) => Log.error(message, data),
        warning: (message, data = null) => Log.warning(message, data),
        debug: (message, data = null) => Log.debug(message, data)
    };

    /**
     * Listar todos os registros
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async index(req, res) {
        try {
            const records = await this.model.findAll();
            BaseController.log.info('Listagem de registros realizada', { 
                model: this.model.name || 'Unknown',
                count: records.length 
            });
            return res.json({ error: false, data: records });
        } catch (error) {
            BaseController.log.error('Erro ao listar registros', { 
                model: this.model.name || 'Unknown',
                error: error.message 
            });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    /**
     * Obter um registro específico
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async show(req, res) {
        try {
            const record = await this.model.findById(req.params.id);
            if (!record) {
                BaseController.log.warning('Registro não encontrado', { 
                    model: this.model.name || 'Unknown',
                    id: req.params.id 
                });
                return res.status(404).json({ error: true, message: 'Registro não encontrado' });
            }
            BaseController.log.info('Registro consultado', { 
                model: this.model.name || 'Unknown',
                id: req.params.id 
            });
            return res.json({ error: false, data: record });
        } catch (error) {
            BaseController.log.error('Erro ao buscar registro', { 
                model: this.model.name || 'Unknown',
                id: req.params.id,
                error: error.message 
            });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    /**
     * Criar um novo registro
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async store(req, res) {
        try {
            const record = await this.model.create(req.body);
            BaseController.log.info('Novo registro criado', { 
                model: this.model.name || 'Unknown',
                id: record.id,
                data: req.body 
            });
            return res.status(201).json({ error: false, data: record });
        } catch (error) {
            BaseController.log.error('Erro ao criar registro', { 
                model: this.model.name || 'Unknown',
                data: req.body,
                error: error.message 
            });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    /**
     * Atualizar um registro
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async update(req, res) {
        try {
            const record = await this.model.findById(req.params.id);
            if (!record) {
                BaseController.log.warning('Registro não encontrado para atualização', { 
                    model: this.model.name || 'Unknown',
                    id: req.params.id 
                });
                return res.status(404).json({ error: true, message: 'Registro não encontrado' });
            }
            const updatedRecord = await this.model.update(req.params.id, req.body);
            BaseController.log.info('Registro atualizado', { 
                model: this.model.name || 'Unknown',
                id: req.params.id,
                updatedFields: Object.keys(req.body) 
            });
            return res.json({ error: false, data: updatedRecord });
        } catch (error) {
            BaseController.log.error('Erro ao atualizar registro', { 
                model: this.model.name || 'Unknown',
                id: req.params.id,
                error: error.message 
            });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    /**
     * Excluir um registro
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async destroy(req, res) {
        try {
            const record = await this.model.findById(req.params.id);
            if (!record) {
                BaseController.log.warning('Registro não encontrado para exclusão', { 
                    model: this.model.name || 'Unknown',
                    id: req.params.id 
                });
                return res.status(404).json({ error: true, message: 'Registro não encontrado' });
            }
            await this.model.delete(req.params.id);
            BaseController.log.info('Registro excluído', { 
                model: this.model.name || 'Unknown',
                id: req.params.id 
            });
            return res.json({ error: false, message: 'Registro excluído com sucesso' });
        } catch (error) {
            BaseController.log.error('Erro ao excluir registro', { 
                model: this.model.name || 'Unknown',
                id: req.params.id,
                error: error.message 
            });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    /**
     * Resposta padrão em JSON
     * @param {Response} res Objeto de resposta do Express
     * @param {number} status Código de status HTTP
     * @param {Object} data Dados da resposta
     */
    jsonResponse(res, status = 200, data = {}) {
        return res.status(status).json(data);
    }

    /**
     * Resposta de erro padrão
     * @param {Response} res Objeto de resposta do Express
     * @param {number} status Código de status HTTP
     * @param {string} message Mensagem de erro
     */
    errorResponse(res, status = 500, message = 'Erro interno do servidor') {
        return this.jsonResponse(res, status, { error: message });
    }

    /**
     * Resposta de sucesso padrão
     * @param {Response} res Objeto de resposta do Express
     * @param {Object} data Dados da resposta
     * @param {string} message Mensagem de sucesso
     */
    successResponse(res, data = {}, message = 'Operação realizada com sucesso') {
        return this.jsonResponse(res, 200, {
            message,
            data
        });
    }

    /**
     * Validação de requisição
     * @param {Request} req Objeto de requisição do Express
     * @param {Object} rules Regras de validação
     * @returns {Object} Resultado da validação
     */
    validate(req, rules) {
        const validation = require('../Validations/Validator');
        return validation.validate(req.body, rules);
    }

    /**
     * Renderiza uma view
     * @param {Response} res Objeto de resposta do Express
     * @param {string} view Nome da view
     * @param {Object} data Dados para a view
     */
    render(res, view, data = {}) {
        const viewPath = require('path').join(__dirname, '..', 'Views', `${view}.html`);
        const fs = require('fs');
        
        if (fs.existsSync(viewPath)) {
            let content = fs.readFileSync(viewPath, 'utf8');
            
            // Substitui variáveis na view
            Object.keys(data).forEach(key => {
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
            });
            
            res.send(content);
        } else {
            this.errorResponse(res, 404, 'View não encontrada');
        }
    }

    /**
     * Renderiza uma cell (view parcial reutilizável)
     * @param {string} cell Nome da cell (view parcial)
     * @param {Object} data Dados para a cell
     * @returns {Promise<string>} HTML renderizado
     */
    static async renderCell(cell, data = {}) {
        const ejs = require('ejs');
        const path = require('path');
        const fs = require('fs');
        const cellPath = path.join(__dirname, '..', 'Views', 'Cells', `${cell}.ejs`);
        if (fs.existsSync(cellPath)) {
            return await ejs.renderFile(cellPath, data);
        } else {
            return `<!-- Cell ${cell} não encontrada -->`;
        }
    }

    /**
     * Renderiza uma view EJS com helpers globais e dados de sessão (se houver)
     * @param {string} viewName Nome da view (sem .ejs)
     * @param {Object} data Dados para o template
     * @param {Object} res (opcional) Express response
     * @param {Object} req (opcional) Express request
     * @returns {Promise<string>|void} HTML ou envia resposta
     */
    static async view(viewName, data = {}, res = null, req = null) {
        const path = require('path');
        const { base_url } = require('../Helpers/Common');
        const Flash = require('../Helpers/Flash');
        
        // Carrega todos os helpers automaticamente
        const helpers = this.loadHelpers();
        
        let flashMessages = {};
        let sessionData = {};
        if (req && typeof req.sessionId === 'string' && req.sessionId.length > 0) {
            try {
                flashMessages = await Flash.getAll(req.sessionId);
            } catch (error) {
                console.warn('Erro ao carregar flash messages:', error.message);
            }
            // Injeta dados de sessão se existirem
            sessionData = {
                session: req.session,
                sessionId: req.sessionId,
                user: req.session ? JSON.parse(req.session.data || '{}').user : null
            };
        }

        const _version_ = '1.0.0.';
        const templateData = {
            ...sessionData,
            ...data,
            ...helpers, // Injeta todos os helpers automaticamente
            base_url: (path = '') => base_url(path, req),
            BaseController: this,
            flash: flashMessages,
            _version_,
            hasFlash: (key) => flashMessages[key] !== undefined,
            getFlash: (key) => flashMessages[key] || null
        };
        if (res) {
            // Usa o Express para renderizar, permitindo layouts/sections do ejs-mate
            return res.render(viewName, templateData);
        } else {
            // Renderização manual (string)
            const ejs = require('ejs');
            const viewPath = resolveAppPath('App', 'Views', `${viewName}.ejs`);
            return await ejs.renderFile(viewPath, templateData, { async: true });
        }
    }

    /**
     * Carrega dados da sessão para uso nos controllers
     * @param {Object} req - Requisição
     * @returns {Object} Dados da sessão
     */
    static loadSession(req) {
        const Session = require('../Helpers/Session');
        return {
            session: req.session,
            sessionId: req.sessionId,
            user: req.session ? JSON.parse(req.session.data || '{}').user : null
        };
    }

    /**
     * Métodos utilitários para flash messages
     */
    static async flashSuccess(req, key, message) {
        if (req && req.sessionId) {
            const Flash = require('../Helpers/Flash');
            await Flash.setSuccess(req.sessionId, key, message);
        }
    }
    static async flashError(req, key, message) {
        if (req && req.sessionId) {
            const Flash = require('../Helpers/Flash');
            await Flash.setError(req.sessionId, key, message);
        }
    }
    static async flashWarning(req, key, message) {
        if (req && req.sessionId) {
            const Flash = require('../Helpers/Flash');
            await Flash.setWarning(req.sessionId, key, message);
        }
    }
    static async flashInfo(req, key, message) {
        if (req && req.sessionId) {
            const Flash = require('../Helpers/Flash');
            await Flash.setInfo(req.sessionId, key, message);
        }
    }
    static async flash(req, key, message, type = 'info') {
        if (req && req.sessionId) {
            const Flash = require('../Helpers/Flash');
            await Flash.set(req.sessionId, key, message, type);
        }
    }

    /**
     * Métodos utilitários para manipulação de dados de sessão
     */
    static async setSessionData(req, key, value) {
        if (req && typeof req.sessionId === 'string' && req.sessionId.length > 0) {
            const Session = require('../Helpers/Session');
            await Session.setValue(req.sessionId, key, value);
        }
    }
    static async getSessionData(req, key, defaultValue = null) {
        if (req && typeof req.sessionId === 'string' && req.sessionId.length > 0) {
            const Session = require('../Helpers/Session');
            return await Session.getValue(req.sessionId, key, defaultValue);
        }
        return defaultValue;
    }
    static async clearSessionData(req, key) {
        if (req && typeof req.sessionId === 'string' && req.sessionId.length > 0) {
            const Session = require('../Helpers/Session');
            await Session.removeValue(req.sessionId, key);
        }
    }
}

module.exports = BaseController; 