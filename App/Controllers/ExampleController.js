const path = require('path');
const BaseController = require('./BaseController');

class ExampleController extends BaseController {
    /**
     * Página de exemplo com flash messages
     */
    static async index(req, res) {
        // Exemplos de como usar flash messages
        const action = req.query.action;
        
        // Exemplo de uso de sessão (opcional)
        // await BaseController.setSessionData(req, 'exemplo', { foo: 'bar' });
        // const valor = await BaseController.getSessionData(req, 'exemplo');
        // await BaseController.clearSessionData(req, 'exemplo');

        if (req.sessionId && action) {
            if (action === 'success') {
                await BaseController.flashSuccess(req, 'example', 'Operação realizada com sucesso!');
            } else if (action === 'error') {
                await BaseController.flashError(req, 'example', 'Ocorreu um erro na operação.');
            } else if (action === 'warning') {
                await BaseController.flashWarning(req, 'example', 'Atenção: Esta é uma mensagem de aviso.');
            } else if (action === 'info') {
                await BaseController.flashInfo(req, 'example', 'Informação: Esta é uma mensagem informativa.');
            } else if (action === 'multiple') {
                await BaseController.flashSuccess(req, 'success_msg', 'Mensagem de sucesso!');
                await BaseController.flashError(req, 'error_msg', 'Mensagem de erro!');
                await BaseController.flashWarning(req, 'warning_msg', 'Mensagem de aviso!');
                await BaseController.flashInfo(req, 'info_msg', 'Mensagem informativa!');
            }
        }
        
        // Chamada correta, sem return:
        BaseController.view('example', {
            title: 'Exemplo de Flash Messages',
            description: 'Esta página demonstra como usar o sistema de flash messages similar ao CodeIgniter 4'
        }, res, req);
    }
}

module.exports = ExampleController; 