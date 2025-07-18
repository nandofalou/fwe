const BaseController = require('./BaseController');
const Category = require('../Models/Category');
const CategoryValidator = require('../Validations/CategoryValidator');

class CategoryController extends BaseController {
    /**
     * Lista todas as categorias
     */
    static async index(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const categories = await Category.get();
            
            return BaseController.view('category/index', {
                title: 'Categorias - FWE',
                categories: categories
            }, res, req);
        } catch (error) {
            CategoryController.log.error('Erro ao listar categorias', { error: error.message });
            await BaseController.flashError(req, 'categories', 'Erro ao carregar categorias');
            return res.redirect('/dashboard');
        }
    }

    /**
     * Exibe formulário para criar/editar categoria
     */
    static async edit(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            let category = null;
            let isEdit = false;

            // Se tem ID, busca a categoria para edição
            if (req.params.id) {
                const validation = CategoryValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'categories', 'ID inválido');
                    return res.redirect('/category');
                }

                category = await Category.find(req.params.id);
                if (!category) {
                    await BaseController.flashError(req, 'categories', 'Categoria não encontrada');
                    return res.redirect('/category');
                }
                isEdit = true;
            }

            return BaseController.view('category/edit', {
                title: isEdit ? 'Editar Categoria - FWE' : 'Nova Categoria - FWE',
                category: category,
                isEdit: isEdit
            }, res, req);
        } catch (error) {
            CategoryController.log.error('Erro ao carregar formulário de categoria', { error: error.message });
            await BaseController.flashError(req, 'categories', 'Erro ao carregar formulário');
            return res.redirect('/category');
        }
    }

    /**
     * Cria uma nova categoria
     */
    static async store(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const validation = CategoryValidator.validateCreate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'categories', 'Dados inválidos');
                return res.redirect('/category/edit');
            }

            const data = req.body;
            data.multiplo = data.multiplo ? 1 : 0;
            data.fluxo = data.fluxo ? 1 : 0;
            
            await Category.insert(data);
            
            await BaseController.flashSuccess(req, 'categories', 'Categoria criada com sucesso!');
            return res.redirect('/category');
        } catch (error) {
            CategoryController.log.error('Erro ao criar categoria', { error: error.message });
            await BaseController.flashError(req, 'categories', 'Erro ao criar categoria');
            return res.redirect('/category/edit');
        }
    }

    /**
     * Atualiza uma categoria existente
     */
    static async update(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const validation = CategoryValidator.validateUpdate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'categories', 'Dados inválidos');
                return res.redirect(`/category/edit/${req.params.id}`);
            }

            const data = req.body;
            data.multiplo = data.multiplo ? 1 : 0;
            data.fluxo = data.fluxo ? 1 : 0;
            await Category.update(req.params.id, data);
            
            await BaseController.flashSuccess(req, 'categories', 'Categoria atualizada com sucesso!');
            return res.redirect('/category');
        } catch (error) {
            CategoryController.log.error('Erro ao atualizar categoria', { error: error.message });
            await BaseController.flashError(req, 'categories', 'Erro ao atualizar categoria');
            return res.redirect(`/category/edit/${req.params.id}`);
        }
    }
}

module.exports = CategoryController; 