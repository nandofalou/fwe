const path = require('path');
const ejs = require('ejs');
const BaseController = require('./BaseController');

class ExampleController {
    static async index(req, res) {
        const now = new Date();
        const data = {
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR'),
            versao: require(path.join(process.cwd(), 'package.json')).version,
            linhas: [1, 2, 3, 4, 5],
            BaseController
        };
        const viewPath = path.join(process.cwd(), 'App', 'Views', 'example.ejs');
        try {
            const html = await ejs.renderFile(viewPath, data, { async: true });
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        } catch (err) {
            res.status(500).send('Erro ao renderizar view: ' + err.message);
        }
    }
}

module.exports = ExampleController; 