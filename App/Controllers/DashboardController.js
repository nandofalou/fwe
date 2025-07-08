const path = require('path');
const BaseController = require('./BaseController');
const { base_url } = require('../Helpers/Common');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../Config/Config');

class DashboardController extends BaseController {
    static async index(req, res) {
        const now = new Date();
        const logo = base_url('assets/image/logo.png', req);
        return BaseController.view('dashboard/index', {
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR'),
            versao: require(path.join(process.cwd(), 'package.json')).version,
            linhas: [1, 2, 3, 4, 5],
            logo
        }, res, req);
    }
}

module.exports = DashboardController; 