const path = require('path');
const BaseController = require('./BaseController');

class HomeController extends BaseController {
    static async index(req, res) {
        const now = new Date();
        return BaseController.view('home', {
            mensagem: 'Bem-vindo!',
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR')
        }, res, req);
    }
}

module.exports = HomeController; 