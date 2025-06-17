/**
 * Classe para manipulação de respostas HTTP
 */
class Response {
    /**
     * Envia uma resposta JSON
     * @param {Object} res Objeto de resposta
     * @param {number} statusCode Código de status
     * @param {Object} data Dados da resposta
     * @param {string} message Mensagem da resposta
     */
    static json(res, statusCode = 200, data = null, message = '') {
        res.status(statusCode).json({
            status: statusCode,
            message,
            data
        });
    }

    /**
     * Envia uma resposta de sucesso
     * @param {Object} res Objeto de resposta
     * @param {Object} data Dados da resposta
     * @param {string} message Mensagem da resposta
     */
    static success(res, data = null, message = 'Operação realizada com sucesso') {
        this.json(res, 200, data, message);
    }

    /**
     * Envia uma resposta de erro
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     * @param {number} statusCode Código de status
     * @param {Object} data Dados adicionais
     */
    static error(res, message = 'Erro interno do servidor', statusCode = 500, data = null) {
        this.json(res, statusCode, data, message);
    }

    /**
     * Envia uma resposta de erro de validação
     * @param {Object} res Objeto de resposta
     * @param {Object} errors Erros de validação
     * @param {string} message Mensagem do erro
     */
    static validationError(res, errors, message = 'Erro de validação') {
        this.json(res, 422, errors, message);
    }

    /**
     * Envia uma resposta de erro de autenticação
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static unauthorized(res, message = 'Não autorizado') {
        this.json(res, 401, null, message);
    }

    /**
     * Envia uma resposta de erro de autorização
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static forbidden(res, message = 'Acesso negado') {
        this.json(res, 403, null, message);
    }

    /**
     * Envia uma resposta de erro de não encontrado
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static notFound(res, message = 'Recurso não encontrado') {
        this.json(res, 404, null, message);
    }

    /**
     * Envia uma resposta de erro de método não permitido
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static methodNotAllowed(res, message = 'Método não permitido') {
        this.json(res, 405, null, message);
    }

    /**
     * Envia uma resposta de erro de conflito
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static conflict(res, message = 'Conflito') {
        this.json(res, 409, null, message);
    }

    /**
     * Envia uma resposta de erro de servidor
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static serverError(res, message = 'Erro interno do servidor') {
        this.json(res, 500, null, message);
    }

    /**
     * Envia uma resposta de erro de serviço indisponível
     * @param {Object} res Objeto de resposta
     * @param {string} message Mensagem do erro
     */
    static serviceUnavailable(res, message = 'Serviço indisponível') {
        this.json(res, 503, null, message);
    }

    /**
     * Envia uma resposta de redirecionamento
     * @param {Object} res Objeto de resposta
     * @param {string} url URL de redirecionamento
     * @param {number} statusCode Código de status
     */
    static redirect(res, url, statusCode = 302) {
        res.redirect(statusCode, url);
    }

    /**
     * Envia uma resposta de download
     * @param {Object} res Objeto de resposta
     * @param {string} filePath Caminho do arquivo
     * @param {string} fileName Nome do arquivo
     */
    static download(res, filePath, fileName) {
        res.download(filePath, fileName);
    }

    /**
     * Envia uma resposta de arquivo
     * @param {Object} res Objeto de resposta
     * @param {string} filePath Caminho do arquivo
     * @param {Object} options Opções do arquivo
     */
    static sendFile(res, filePath, options = {}) {
        res.sendFile(filePath, options);
    }

    /**
     * Envia uma resposta de texto
     * @param {Object} res Objeto de resposta
     * @param {string} text Texto da resposta
     * @param {number} statusCode Código de status
     */
    static text(res, text, statusCode = 200) {
        res.status(statusCode).send(text);
    }

    /**
     * Envia uma resposta de HTML
     * @param {Object} res Objeto de resposta
     * @param {string} html HTML da resposta
     * @param {number} statusCode Código de status
     */
    static html(res, html, statusCode = 200) {
        res.status(statusCode).send(html);
    }

    /**
     * Envia uma resposta de XML
     * @param {Object} res Objeto de resposta
     * @param {string} xml XML da resposta
     * @param {number} statusCode Código de status
     */
    static xml(res, xml, statusCode = 200) {
        res.status(statusCode).type('application/xml').send(xml);
    }

    /**
     * Envia uma resposta de CSV
     * @param {Object} res Objeto de resposta
     * @param {string} csv CSV da resposta
     * @param {string} fileName Nome do arquivo
     */
    static csv(res, csv, fileName) {
        res.attachment(fileName);
        res.type('text/csv');
        res.send(csv);
    }

    /**
     * Envia uma resposta de PDF
     * @param {Object} res Objeto de resposta
     * @param {Buffer} pdf PDF da resposta
     * @param {string} fileName Nome do arquivo
     */
    static pdf(res, pdf, fileName) {
        res.attachment(fileName);
        res.type('application/pdf');
        res.send(pdf);
    }

    /**
     * Envia uma resposta de imagem
     * @param {Object} res Objeto de resposta
     * @param {Buffer} image Imagem da resposta
     * @param {string} type Tipo da imagem
     */
    static image(res, image, type) {
        res.type(`image/${type}`);
        res.send(image);
    }
}

module.exports = Response; 