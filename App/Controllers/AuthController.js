const path = require('path');
const BaseController = require('./BaseController');
const { base_url } = require('../Helpers/Common');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../Config/Config');

class AuthController extends BaseController {
    static async index(req, res) {
        const now = new Date();
        const logo = base_url('assets/image/logo.png', req);
        return BaseController.view('auth/login', {
            data: now.toLocaleDateString('pt-BR'),
            hora: now.toLocaleTimeString('pt-BR'),
            versao: require(path.join(process.cwd(), 'package.json')).version,
            linhas: [1, 2, 3, 4, 5],
            logo
        }, res, req);
    }
    
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validar dados
            if (!email || !password) {
                return res.redirect('/auth');
            }

            // Buscar usuário
            const user = await User.findByEmail(email);
            if (!user || !user.active) {
                AuthController.log.warning('Tentativa de login com credenciais inválidas', { email });
                return res.redirect('/auth');
            }

            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.pass);
            if (!isValidPassword) {
                AuthController.log.warning('Tentativa de login com senha incorreta', { email, userId: user.id });
                return res.redirect('/auth');
            }

            // Gerar token (opcional, se for usar sessão)
            // const token = jwt.sign(
            //     { id: user.id, email: user.email },
            //     config.jwt.secret,
            //     { expiresIn: config.jwt.expiresIn }
            // );

            AuthController.log.info('Login realizado com sucesso', { userId: user.id, email: user.email });

            // Aqui você pode salvar dados do usuário na sessão, se desejar
            // req.session.user = { id: user.id, name: user.name, email: user.email };

            return res.redirect('/dashboard');
        } catch (error) {
            AuthController.log.error('Erro ao fazer login', { email: req.body.email, error: error.message });
            return res.redirect('/auth');
        }
    }
}

module.exports = AuthController; 