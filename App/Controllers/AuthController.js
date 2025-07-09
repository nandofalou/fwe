const path = require('path');
const BaseController = require('./BaseController');
const { base_url } = require('../Helpers/Common');
const User = require('../Models/User');
const bcrypt = require('bcrypt');

class AuthController extends BaseController {
    /**
     * Exibe a página de login
     */
    static async index(req, res) {
        return BaseController.view('auth/login', {}, res, req);
    }

    /**
     * Processa o login do usuário
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validação básica
            if (!email || !password) {
                await BaseController.flashError(req, 'login', 'Email e senha são obrigatórios');
                return res.redirect('/auth');
            }

            // Busca o usuário pelo email
            const user = await User.findByEmail(email);
            if (!user) {
                await BaseController.flashError(req, 'login', 'Credenciais inválidas');
                return res.redirect('/auth');
            }

            // Verifica se o usuário tem senha definida
            if (!user.pass) {
                await BaseController.flashError(req, 'login', 'Usuário sem senha cadastrada.');
                return res.redirect('/auth');
            }

            // Verifica a senha
            const isValidPassword = await bcrypt.compare(password, user.pass);
            if (!isValidPassword) {
                await BaseController.flashError(req, 'login', 'Credenciais inválidas');
                return res.redirect('/auth');
            }

            // Cria a sessão
            const userSession = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            try {
                await BaseController.setSessionData(req, 'user', userSession);
            } catch (e) {
                await BaseController.flashError(req, 'login', 'Erro ao salvar sessão');
                return res.redirect('/auth');
            }

            await BaseController.flashSuccess(req, 'login', `Bem-vindo, ${user.name}!`);
            return res.redirect('/dashboard');

        } catch (error) {
            await BaseController.flashError(req, 'login', 'Erro interno do servidor');
            return res.redirect('/auth');
        }
    }

    /**
     * Processa o logout do usuário
     */
    static async logout(req, res) {
        try {
            // Remove a sessão do banco
            await BaseController.clearSessionData(req, 'user_data');

            // Limpa o cookie
            res.clearCookie('fwe_session_id');

            await BaseController.flashSuccess(req, 'logout', 'Logout realizado com sucesso');
            return res.redirect('/auth');

        } catch (error) {
            AuthController.log.error('Erro no logout', { error: error.message });
            await BaseController.flashError(req, 'logout', 'Erro ao realizar logout');
            return res.redirect('/auth');
        }
    }
}

module.exports = AuthController; 