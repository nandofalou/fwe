const Log = require('../Helpers/Log');
const path = require('path');
const ejs = require('ejs');
const { base_url } = require('../Helpers/Common');

class BaseController {
    constructor(model) {
        this.model = model;
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
            this.log.info('Listagem de registros realizada', { 
                model: this.model.name || 'Unknown',
                count: records.length 
            });
            return res.json({ error: false, data: records });
        } catch (error) {
            this.log.error('Erro ao listar registros', { 
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
                this.log.warning('Registro não encontrado', { 
                    model: this.model.name || 'Unknown',
                    id: req.params.id 
                });
                return res.status(404).json({ error: true, message: 'Registro não encontrado' });
            }
            this.log.info('Registro consultado', { 
                model: this.model.name || 'Unknown',
                id: req.params.id 
            });
            return res.json({ error: false, data: record });
        } catch (error) {
            this.log.error('Erro ao buscar registro', { 
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
            this.log.info('Novo registro criado', { 
                model: this.model.name || 'Unknown',
                id: record.id,
                data: req.body 
            });
            return res.status(201).json({ error: false, data: record });
        } catch (error) {
            this.log.error('Erro ao criar registro', { 
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
                this.log.warning('Registro não encontrado para atualização', { 
                    model: this.model.name || 'Unknown',
                    id: req.params.id 
                });
                return res.status(404).json({ error: true, message: 'Registro não encontrado' });
            }
            const updatedRecord = await this.model.update(req.params.id, req.body);
            this.log.info('Registro atualizado', { 
                model: this.model.name || 'Unknown',
                id: req.params.id,
                updatedFields: Object.keys(req.body) 
            });
            return res.json({ error: false, data: updatedRecord });
        } catch (error) {
            this.log.error('Erro ao atualizar registro', { 
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
                this.log.warning('Registro não encontrado para exclusão', { 
                    model: this.model.name || 'Unknown',
                    id: req.params.id 
                });
                return res.status(404).json({ error: true, message: 'Registro não encontrado' });
            }
            await this.model.delete(req.params.id);
            this.log.info('Registro excluído', { 
                model: this.model.name || 'Unknown',
                id: req.params.id 
            });
            return res.json({ error: false, message: 'Registro excluído com sucesso' });
        } catch (error) {
            this.log.error('Erro ao excluir registro', { 
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
     * Renderiza uma view EJS com helpers globais
     * @param {string} viewName Nome da view (sem .ejs)
     * @param {Object} data Dados para o template
     * @param {Object} res (opcional) Express response
     * @returns {Promise<string>|void} HTML ou envia resposta
     */
    static async view(viewName, data = {}, res = null) {
        const viewPath = path.join(process.cwd(), 'App', 'Views', `${viewName}.ejs`);
        const templateData = {
            ...data,
            base_url,
            BaseController: this
        };
        try {
            const html = await ejs.renderFile(viewPath, templateData, { async: true });
            if (res) {
                res.set('Content-Type', 'text/html; charset=utf-8');
                return res.send(html);
            }
            return html;
        } catch (err) {
            if (res) {
                return res.status(500).send('Erro ao renderizar view: ' + err.message);
            }
            throw err;
        }
    }
}

module.exports = BaseController; 