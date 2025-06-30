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
                    email: updatedUser.email,
                    avatar: updatedUser.avatar
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

    // Método de listagem de usuários como método estático
    static async index(req, res) {
        try {
            const userModel = new User();
            const users = await userModel.findAll();
            // Remover o campo 'pass' de cada usuário
            const usersSafe = users.map(({ pass, ...rest }) => rest);
            
            UserController.log.info('Listagem de usuários realizada', { count: usersSafe.length });
            
            return res.json({ error: false, data: usersSafe });
        } catch (error) {
            UserController.log.error('Erro ao listar usuários', { error: error.message });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    static async show(req, res) {
        try {
            const userModel = new User();
            const user = await userModel.find(req.params.id);
            if (!user) {
                return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
            }
            // Retornar todos os campos relevantes, exceto o hash da senha
            const { pass, ...userData } = user;
            
            UserController.log.info('Usuário consultado', { userId: req.params.id });
            
            return res.json({ error: false, data: userData });
        } catch (error) {
            UserController.log.error('Erro ao buscar usuário', { userId: req.params.id, error: error.message });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    static async store(req, res) {
        try {
            const userModel = new User();
            // Espera-se: name, email, pass, permission_id, active
            const { name, email, pass, permission_id, active } = req.body;
            if (!name || !email || !pass || !permission_id) {
                return res.status(400).json({ error: true, message: 'Campos obrigatórios: name, email, pass, permission_id' });
            }
            const user = await userModel.create({
                name,
                email,
                pass,
                permission_id,
                active: active !== undefined ? active : 1
            });
            
            UserController.log.info('Novo usuário criado', { userId: user.id, email: user.email, permissionId: user.permission_id });
            
            return res.status(201).json({ error: false, data: user });
        } catch (error) {
            UserController.log.error('Erro ao criar usuário', { error: error.message, data: req.body });
            return res.status(500).json({ error: true, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const userModel = new User();
            const user = await userModel.find(req.params.id);
            if (!user) {
                return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
            }
            // Permitir atualização dos campos: name, email, pass, permission_id, active, hash, hash_date_validate, deleted_at
            const updateData = {};
            [
                'name', 'email', 'pass', 'permission_id', 'active', 'hash', 'hash_date_validate', 'deleted_at'
            ].forEach(field => {
                if (req.body[field] !== undefined) updateData[field] = req.body[field];
            });
            const updatedUser = await userModel.update(req.params.id, updateData);
            
            UserController.log.info('Usuário atualizado', { userId: req.params.id, updatedFields: Object.keys(updateData) });
            
            return res.json({ error: false, data: updatedUser });
        } catch (error) {
            UserController.log.error('Erro ao atualizar usuário', { userId: req.params.id, error: error.message });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }

    static async destroy(req, res) {
        try {
            const userModel = new User();
            const user = await userModel.find(req.params.id);
            if (!user) {
                return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
            }
            await userModel.delete(req.params.id);
            
            UserController.log.info('Usuário excluído', { userId: req.params.id, email: user.email });
            
            return res.json({ error: false, message: 'Usuário excluído com sucesso' });
        } catch (error) {
            UserController.log.error('Erro ao excluir usuário', { userId: req.params.id, error: error.message });
            return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
        }
    }
}

module.exports = UserController; 