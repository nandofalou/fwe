class BaseController {
    constructor() {
        this.model = null;
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
}

module.exports = BaseController; 