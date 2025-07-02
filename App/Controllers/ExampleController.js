const path = require('path');
const BaseController = require('./BaseController');

class ExampleController {
    static async index(req, res) {
        const now = new Date();
        return BaseController.view('example', {
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR'),
            versao: require(path.join(process.cwd(), 'package.json')).version,
            linhas: [1, 2, 3, 4, 5]
        }, res);
    }
}

module.exports = ExampleController; 