/**
 * Classe para manipulação de respostas HTTP
 */
module.exports = {
    success(data = null, message = null, extra = {}) {
        return { status: true, message, data, ...extra };
    },
    error(message = 'Erro inesperado', error = null, data = null, extra = {}) {
        return { status: false, message, error, data, ...extra };
    },
    access(status, data = null, extra = {}) {
        return { status: true,...data, ...extra };
    }
}; 