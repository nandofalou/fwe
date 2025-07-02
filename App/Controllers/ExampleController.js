const path = require('path');
const BaseController = require('./BaseController');
const { base_url } = require('../Helpers/Common');

class ExampleController {
    static async index(req, res) {
        const now = new Date();
        const logo = base_url('assets/image/logo.png', req);
        return BaseController.view('example', {
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR'),
            versao: require(path.join(process.cwd(), 'package.json')).version,
            linhas: [1, 2, 3, 4, 5],
            logo
        }, res, req);
    }
}

module.exports = ExampleController; 