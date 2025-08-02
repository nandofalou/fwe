const BaseController = require('./BaseController');
const User = require('../Models/User');
const UserValidator = require('../Validations/UserValidator');
const Permission = require('../Models/Permission');
const Security = require('../Helpers/Security');

class UserController extends BaseController {
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const users = await User.leftJoin('permission', 'users.permission_id = permission.id')
                .select(['users.id', 'users.name', 'users.email', 'users.active', 'permission.name as permissionName'])
                .get();
            return BaseController.view('user/index', {
                title: 'Usuários',
                users
            }, res, req);
        } catch (error) {
            UserController.log.error('Erro ao listar usuários', { error: error.message });
            await BaseController.flashError(req, 'users', 'Erro ao listar usuários');
            return res.redirect('/dashboard');
        }
    }

    static async edit(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            let user = null;
            let isEdit = false;
            const permissions = await Permission.get();
            if (req.params.id) {
                const validation = UserValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'users', 'ID inválido');
                    return res.redirect('/user');
                }
                user = await User.find(req.params.id);
                if (!user) {
                    await BaseController.flashError(req, 'users', 'Usuário não encontrado');
                    return res.redirect('/user');
                }
                isEdit = true;
            }
            return BaseController.view('user/edit', {
                title: isEdit ? 'Editar Usuário' : 'Novo Usuário',
                user,
                isEdit,
                permissions
            }, res, req);
        } catch (error) {
            UserController.log.error('Erro ao carregar formulário de usuário', { error: error.message });
            await BaseController.flashError(req, 'users', 'Erro ao carregar formulário');
            return res.redirect('/user');
        }
    }

    static async store(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const data = req.body;
            const validation = UserValidator.validateCreate(data);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'users', 'Dados inválidos');
                return res.redirect('/user/edit');
            }
            // Encriptar senha
            data.pass = await Security.hashPassword(data.pass);
            await User.insert(data);
            await BaseController.flashSuccess(req, 'users', 'Usuário criado com sucesso!');
            return res.redirect('/user');
        } catch (error) {
            UserController.log.error('Erro ao criar usuário', { error: error.message });
            await BaseController.flashError(req, 'users', 'Erro ao criar usuário');
            return res.redirect('/user/edit');
        }
    }

    static async update(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const data = req.body;
            const validation = UserValidator.validateUpdate(data);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'users', 'Dados inválidos');
                return res.redirect(`/user/edit/${req.params.id}`);
            }
            // Só atualiza a senha se for informada
            if (data.pass && data.pass.length > 0) {
                data.pass = await Security.hashPassword(data.pass);
            } else {
                delete data.pass;
            }
            await User.update(req.params.id, data);
            await BaseController.flashSuccess(req, 'users', 'Usuário atualizado com sucesso!');
            return res.redirect('/user');
        } catch (error) {
            UserController.log.error('Erro ao atualizar usuário', { error: error.message });
            await BaseController.flashError(req, 'users', 'Erro ao atualizar usuário');
            return res.redirect(`/user/edit/${req.params.id}`);
        }
    }

    static async delete(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            // Não pode excluir a si mesmo
            if (parseInt(req.params.id) === parseInt(sessionData.user.id)) {
                await BaseController.flashError(req, 'users', 'Você não pode excluir seu próprio usuário!');
                return res.redirect('/user');
            }
            await User.delete(req.params.id);
            await BaseController.flashSuccess(req, 'users', 'Usuário excluído com sucesso!');
            return res.redirect('/user');
        } catch (error) {
            UserController.log.error('Erro ao excluir usuário', { error: error.message });
            await BaseController.flashError(req, 'users', 'Erro ao excluir usuário');
            return res.redirect('/user');
        }
    }
}

module.exports = UserController; 