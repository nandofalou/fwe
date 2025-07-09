const path = require('path');
const BaseController = require('./BaseController');

class HomeController extends BaseController {
    /**
     * Página inicial
     */
    static async index(req, res) {
        // Exemplo de como definir flash messages (quando houver sessionId)
        // await BaseController.flashSuccess(req, 'welcome', 'Bem-vindo ao FWE Framework!');
        // await BaseController.flashInfo(req, 'tip', 'Dica: Use /docs para ver a documentação');
        
        return BaseController.view('home', {
            title: 'FWE Framework',
            version: '1.0.0',
            currentTime: new Date().toLocaleString('pt-BR'),
            features: [
                'Sistema de autenticação completo',
                'Sessões persistentes no banco',
                'Flash messages (como CodeIgniter 4)',
                'Documentação integrada',
                'API RESTful',
                'Sistema de rotas avançado'
            ]
        }, res, req);
    }
}

module.exports = HomeController; 