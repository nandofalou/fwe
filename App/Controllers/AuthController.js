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
        return BaseController.view('auth/login', {}, res, req);
    }
    
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validar se ambos os campos foram preenchidos
            if (!email || !password) {
                return res.redirect('/auth');
            }

            // Buscar usuário e validar credenciais em uma única verificação
            const user = await User.findByEmail(email);
            let isValidCredentials = false;

            if (user && user.active) {
                // Verificar senha apenas se o usuário existir e estiver ativo
                const isValidPassword = await bcrypt.compare(password, user.pass);
                isValidCredentials = isValidPassword;
            }

            // Se as credenciais não são válidas, log e redireciona com mensagem genérica
            if (!isValidCredentials) {
                AuthController.log.warning('Tentativa de login com credenciais inválidas', { email });
                return res.redirect('/auth');
            }

            // Login bem-sucedido
            AuthController.log.info('Login realizado com sucesso', { userId: user.id, email: user.email });

            // Salva dados do usuário na sessão persistente
            const Session = require('../Helpers/Session');
            await Session.setValue(req.sessionId, 'user', {
                id: user.id,
                name: user.name,
                email: user.email
            });

            return res.redirect('/dashboard');
        } catch (error) {
            AuthController.log.error('Erro ao fazer login', { email: req.body.email, error: error.message });
            return res.redirect('/auth');
        }
    }

    static async logout(req, res) {
        try {
            // Destrói a sessão
            const Session = require('../Helpers/Session');
            if (req.sessionId) {
                await Session.destroy(req.sessionId);
            }

            // Limpa o cookie de sessão
            res.setHeader('Set-Cookie', 'fwe_session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');

            AuthController.log.info('Logout realizado com sucesso');
            return res.redirect('/');
        } catch (error) {
            AuthController.log.error('Erro ao fazer logout', { error: error.message });
            return res.redirect('/');
        }
    }
}

module.exports = AuthController; 