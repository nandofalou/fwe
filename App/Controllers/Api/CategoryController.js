const Category = require('../../Models/Category');
const CategoryValidator = require('../../Validations/CategoryValidator');
const Response = require('../../Helpers/Response');
const BaseController = require('../BaseController');

class CategoryController extends BaseController {
    static async index(req, res) {
        try {
            const categories = await Category.get();
            return res.json(Response.success(categories));
        } catch (error) {
            CategoryController.log.error('Erro ao listar categorias', { error: error.message });
            return res.status(500).json(Response.error('Erro ao listar categorias.', null));
        }
    }
    static async show(req, res) {
        try {
            const validation = CategoryValidator.validateId(req.params.id);
            if (!validation.isValid) {
                return res.status(422).json(Response.error('ID inválido', validation.errors));
            }
            const category = await Category.find(req.params.id);
            if (!category) return res.status(404).json(Response.error('Categoria não encontrada.'));
            return res.json(Response.success(category));
        } catch (error) {
            CategoryController.log.error('Erro ao buscar categoria', { error: error.message });
            return res.status(500).json(Response.error('Erro ao buscar categoria.', null));
        }
    }
    static async store(req, res) {
        const validation = CategoryValidator.validateCreate(req.body);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('Dados inválidos', validation.errors));
        }
        try {
            const data = req.body;
            data.created_by = req.user.id;
            const id = await Category.insert(data);
            return res.status(201).json(Response.success({ id }, 'Categoria criada com sucesso.'));
        } catch (error) {
            CategoryController.log.error('Erro ao criar categoria', { error: error.message });
            return res.status(500).json(Response.error('Erro ao criar categoria.', null));
        }
    }
    static async update(req, res) {
        const validation = CategoryValidator.validateUpdate(req.body);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('Dados inválidos', validation.errors));
        }
        try {
            const data = req.body;
            await Category.update(req.params.id, data);
            return res.json(Response.success(null, 'Categoria atualizado com sucesso.'));
        } catch (error) {
            CategoryController.log.error('Erro ao atualizar categoria', { error: error.message });
            return res.status(500).json(Response.error('Erro ao atualizar categoria.', null));
        }
    }
    static async destroy(req, res) {
        try {
            await Category.delete(req.params.id);
            return res.json(Response.success(null, 'Categoria removido com sucesso.'));
        } catch (error) {
            CategoryController.log.error('Erro ao remover categoria', { error: error.message });
            return res.status(500).json(Response.error('Erro ao remover categoria.', null));
        }
    }
}

module.exports = CategoryController;