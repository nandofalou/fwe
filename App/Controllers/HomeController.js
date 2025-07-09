const path = require('path');
const BaseController = require('./BaseController');

class HomeController extends BaseController {
    static async index(req, res) {
        const now = new Date();
        const packageJson = require(path.join(process.cwd(), 'package.json'));
        
        return BaseController.view('home', {
            mensagem: 'Bem-vindo ao FWE Framework!',
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR'),
            nome: packageJson.name.toUpperCase(),
            versao: packageJson.version,
            descricao: packageJson.description
        }, res, req);
    }
}

module.exports = HomeController; 