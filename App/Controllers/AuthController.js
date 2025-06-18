const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../Config/config');
const User = require('../Models/User');

class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validar dados
            if (!email || !password) {
                return res.status(400).json({
                    error: true,
                    message: 'Email e senha são obrigatórios'
                });
            }

            // Buscar usuário
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: true,
                    message: 'Senha inválida'
                });
            }

            // Gerar token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            return res.json({
                error: false,
                message: 'Login realizado com sucesso',
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validar dados
            if (!name || !email || !password) {
                return res.status(400).json({
                    error: true,
                    message: 'Nome, email e senha são obrigatórios'
                });
            }

            // Verificar se email já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    error: true,
                    message: 'Email já cadastrado'
                });
            }

            // Criar usuário
            const user = await User.create({
                name,
                email,
                password
            });

            return res.status(201).json({
                error: false,
                message: 'Usuário criado com sucesso',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Validar email
            if (!email) {
                return res.status(400).json({
                    error: true,
                    message: 'Email é obrigatório'
                });
            }

            // Verificar se usuário existe
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            // TODO: Implementar envio de email com token de recuperação

            return res.json({
                error: false,
                message: 'Email de recuperação enviado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao solicitar recuperação de senha:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            // Validar dados
            if (!token || !password) {
                return res.status(400).json({
                    error: true,
                    message: 'Token e nova senha são obrigatórios'
                });
            }

            // TODO: Implementar validação do token e atualização da senha

            return res.json({
                error: false,
                message: 'Senha redefinida com sucesso'
            });
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;

            // Validar token
            if (!token) {
                return res.status(400).json({
                    error: true,
                    message: 'Token é obrigatório'
                });
            }

            // TODO: Implementar verificação do email

            return res.json({
                error: false,
                message: 'Email verificado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async resendVerification(req, res) {
        try {
            const { email } = req.body;

            // Validar email
            if (!email) {
                return res.status(400).json({
                    error: true,
                    message: 'Email é obrigatório'
                });
            }

            // TODO: Implementar reenvio de email de verificação

            return res.json({
                error: false,
                message: 'Email de verificação reenviado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao reenviar verificação de email:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = AuthController; 