const User = require('../Models/User');
const BaseController = require('./BaseController');

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
                    email: user.email,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
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

            return res.json({
                error: false,
                message: 'Perfil atualizado com sucesso',
                data: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
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
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
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

            return res.json({
                error: false,
                message: 'Senha atualizada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
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

            return res.json({
                error: false,
                message: 'Avatar atualizado com sucesso',
                data: {
                    avatar: updatedUser.avatar
                }
            });
        } catch (error) {
            console.error('Erro ao fazer upload do avatar:', error);
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

            return res.json({
                error: false,
                message: 'Avatar removido com sucesso',
                data: {
                    avatar: updatedUser.avatar
                }
            });
        } catch (error) {
            console.error('Erro ao remover avatar:', error);
            return res.status(500).json({
                error: true,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = UserController; 