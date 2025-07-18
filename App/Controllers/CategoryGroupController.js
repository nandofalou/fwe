const BaseController = require('./BaseController');
const CategoryGroup = require('../Models/CategoryGroup');
const CategoryGroupValidator = require('../Validations/CategoryGroupValidator');

class CategoryGroupController extends BaseController {
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            return BaseController.view('categorygroup/index', {
                title: 'Grupos',
                filter: {}
            }, res, req);
        } catch (error) {
            CategoryGroupController.log.error('Erro ao carregar tela de grupos', { error: error.message });
            await BaseController.flashError(req, 'groups', 'Erro ao carregar tela de grupos');
            return res.redirect('/dashboard');
        }
    }

    static async search(req, res) {
        try {
            let page = parseInt(req.query.page) || 1;
            let perPage = parseInt(req.query.perPage) || 10;
            let draw = 0;
            let searchValue = '';
            const builder = CategoryGroup;
            if (req.query.start !== undefined && req.query.length !== undefined) {
                perPage = parseInt(req.query.length) || 10;
                page = Math.floor((parseInt(req.query.start) || 0) / perPage) + 1;
                draw = parseInt(req.query.draw) || 0;
                builder.limit(perPage, req.query.start);
                if (req.query.search && req.query.search.value) {
                    searchValue = req.query.search.value.trim();
                    builder.like('name', searchValue);
                }
                if (req.query.order && req.query.columns) {
                    const colIdx = parseInt(req.query.order[0].column);
                    const colName = req.query.columns[colIdx].data || req.query.columns[colIdx].name;
                    const dir = req.query.order[0].dir && req.query.order[0].dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                    if (colName) {
                        const columnsOrder = ['id', 'name'];
                        const orderBy = columnsOrder[colIdx] || 'id';
                        builder.orderBy(orderBy, dir);
                    }
                }
            }
            const count = await builder.countQuery('id', perPage);
            const groups = await builder.get();
            const columns = ['id', 'name'];
            // const data = groups.map(item => columns.map(col => item[col]));
            const data = groups.map(item => {
                const row = columns.map(col => item[col]);
                row.push(`<div class="btn-group" role="group">
                            <a href="${BaseController.base_url('group/edit')}/${item.id}" class="btn btn-sm btn-outline-primary btn-edit">
                                <i class="fi fi-pencil"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-danger js-ajax-confirm" title="Excluir" onclick="confirmDelete(1, 'teste abc')">
                                <i class="fi fi-thrash"></i>
                            </button>
                        </div>`);
                return row;
            });


            return res.json({
                data,
                recordsFiltered: count.rows,
                recordsTotal: count.rows,
                perPage: count.perPage,
                pagination: count.pages
            });
        } catch (error) {
            CategoryGroupController.log.error('Erro ao buscar grupos (DataTables)', { error: error.message });
            return res.status(500).json({ error: 'Erro ao buscar grupos' });
        }
    }

    static async edit(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            let group = null;
            let isEdit = false;
            if (req.params.id) {
                const validation = CategoryGroupValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'groups', 'ID inválido');
                    return res.redirect('/group');
                }
                group = await CategoryGroup.find(req.params.id);
                if (!group) {
                    await BaseController.flashError(req, 'groups', 'Grupo não encontrado');
                    return res.redirect('/group');
                }
                isEdit = true;
            }
            return BaseController.view('categorygroup/edit', {
                title: isEdit ? 'Editar Grupo' : 'Novo Grupo',
                group,
                isEdit
            }, res, req);
        } catch (error) {
            CategoryGroupController.log.error('Erro ao carregar formulário de grupo', { error: error.message });
            await BaseController.flashError(req, 'groups', 'Erro ao carregar formulário');
            return res.redirect('/group');
        }
    }

    static async store(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = CategoryGroupValidator.validateCreate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'groups', 'Dados inválidos');
                return res.redirect('/group/edit');
            }
            const data = req.body;
            await CategoryGroup.insert(data);
            await BaseController.flashSuccess(req, 'groups', 'Grupo criado com sucesso!');
            return res.redirect('/group');
        } catch (error) {
            CategoryGroupController.log.error('Erro ao criar grupo', { error: error.message });
            await BaseController.flashError(req, 'groups', 'Erro ao criar grupo');
            return res.redirect('/group/edit');
        }
    }

    static async update(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = CategoryGroupValidator.validateUpdate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'groups', 'Dados inválidos');
                return res.redirect(`/group/edit/${req.params.id}`);
            }
            const data = req.body;
            await CategoryGroup.update(req.params.id, data);
            await BaseController.flashSuccess(req, 'groups', 'Grupo atualizado com sucesso!');
            return res.redirect('/group');
        } catch (error) {
            CategoryGroupController.log.error('Erro ao atualizar grupo', { error: error.message });
            await BaseController.flashError(req, 'groups', 'Erro ao atualizar grupo');
            return res.redirect(`/group/edit/${req.params.id}`);
        }
    }
}

module.exports = CategoryGroupController; 