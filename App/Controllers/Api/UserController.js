const User = require('../../Models/User');
const BaseController = require('../BaseController');
const UserValidator = require('../../Validations/UserValidator');
const Response = require('../../Helpers/Response');

class UserController extends BaseController {
    constructor() {
        super(User);
    }

    /**
     * Obter perfil do usuário
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async profile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            return res.json({
                error: false,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            UserController.log.error('Erro ao obter perfil do usuário', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualizar perfil do usuário
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async updateProfile(req, res) {
        try {
            const { name, email } = req.body;
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar se email já existe
            if (email && email !== user.email) {
                const existingUser = await User.findByEmail(email);
                if (existingUser) {
                    return res.status(400).json({
                        error: true,
                        message: 'Email já cadastrado'
                    });
                }
            }

            // Atualizar usuário
            const updatedUser = await User.update(req.user.id, {
                name: name || user.name,
                email: email || user.email
            });

            UserController.log.info('Perfil de usuário atualizado', { userId: req.user.id, email: updatedUser.email });

            return res.json({
                error: false,
                message: 'Perfil atualizado com sucesso',
                data: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email
                }
            });
        } catch (error) {
            UserController.log.error('Erro ao atualizar perfil do usuário', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualizar senha do usuário
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            // Validar dados
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: true,
                    message: 'Senha atual e nova senha são obrigatórias'
                });
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar senha atual
            const isValidPassword = await bcrypt.compare(currentPassword, user.pass);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: true,
                    message: 'Senha atual inválida'
                });
            }

            // Atualizar senha
            await User.update(req.user.id, {
                password: newPassword
            });

            UserController.log.info('Senha de usuário atualizada', { userId: req.user.id });

            return res.json({
                error: false,
                message: 'Senha atualizada com sucesso'
            });
        } catch (error) {
            UserController.log.error('Erro ao atualizar senha do usuário', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Upload de avatar
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async uploadAvatar(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: true,
                    message: 'Nenhum arquivo enviado'
                });
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            // Atualizar avatar
            const updatedUser = await User.update(req.user.id, {
                avatar: req.file.filename
            });

            UserController.log.info('Avatar de usuário atualizado', { userId: req.user.id, filename: req.file.filename });

            return res.json({
                error: false,
                message: 'Avatar atualizado com sucesso',
                data: {
                    avatar: updatedUser.avatar
                }
            });
        } catch (error) {
            UserController.log.error('Erro ao fazer upload do avatar', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remover avatar
     * @param {Object} req - Requisição
     * @param {Object} res - Resposta
     */
    static async removeAvatar(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            // Remover avatar
            const updatedUser = await User.update(req.user.id, {
                avatar: null
            });

            UserController.log.info('Avatar de usuário removido', { userId: req.user.id });

            return res.json({
                error: false,
                message: 'Avatar removido com sucesso',
                data: {
                    avatar: updatedUser.avatar
                }
            });
        } catch (error) {
            UserController.log.error('Erro ao remover avatar do usuário', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Helper para remover o campo 'pass'
    static hidePassword(user) {
        if (!user) return user;
        const { pass, ...safe } = user;
        return safe;
    }

    // Método de listagem de usuários como método estático
    static async index(req, res) {
        try {
            const users = await User.get();
            const usersSafe = users.map(UserController.hidePassword);
            return res.json(Response.success(usersSafe));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao listar usuários.', null));
        }
    }

    static async show(req, res) {
        try {
            const user = await User.find(req.params.id);
            if (!user) return res.status(404).json(Response.error('Usuário não encontrado.'));
            return res.json(Response.success(UserController.hidePassword(user)));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao buscar usuário.', null));
        }
    }

    static async store(req, res) {
        const validation = UserValidator.validateCreate(req.body);
        if (!validation.isValid) {
            return res.status(422).json({
                error: true,
                message: 'Dados inválidos',
                errors: validation.errors
            });
        }
        try {
            const data = req.body;
            const id = await User.insert(data);
            return res.status(201).json(Response.success({ id }, 'Usuário criado com sucesso.'));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao criar usuário.', null));
        }
    }

    static async update(req, res) {
        const validation = UserValidator.validateUpdate(req.body);
        if (!validation.isValid) {
            return res.status(422).json({
                error: true,
                message: 'Dados inválidos',
                errors: validation.errors
            });
        }
        try {
            const data = req.body;
            await User.update(req.params.id, data);
            return res.json(Response.success(null, 'Usuário atualizado com sucesso.'));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao atualizar usuário.', null));
        }
    }

    static async destroy(req, res) {
        try {
            await User.delete(req.params.id);
            return res.json(Response.success(null, 'Usuário removido com sucesso.'));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao remover usuário.', null));
        }
    }
}

module.exports = UserController; 