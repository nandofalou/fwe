const BaseController = require('./BaseController');
const CategoryGroup = require('../Models/CategoryGroup');
const CategoryGroupValidator = require('../Validations/CategoryGroupValidator');
const Category = require('../Models/Category');
const CategoryGroupItems = require('../Models/CategoryGroupItems');

class CategoryGroupController extends BaseController {
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const groups = await CategoryGroup.get();
            return BaseController.view('categorygroup/index', {
                title: 'Grupos',
                filter: {},
                groups
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
                row.push(`
                    <a href="${BaseController.base_url('group/edit/' + item.id)}" class="btn btn-sm btn-outline-primary"><i class="fi fi-pencil"></i></a>
                    <form method="POST" action="${BaseController.base_url('group/' + item.id)}" style="display:inline;" onsubmit="return confirm('Tem certeza que deseja excluir este grupo?');">
                        <button type="submit" class="btn btn-sm btn-danger"><i class="fi fi-thrash"></i></button>
                    </form>
                    <a href="${BaseController.base_url('group/' + item.id + '/category')}" class="btn btn-sm btn-secondary" title="Associar Categorias"><i class="fi fi-cog"></i></a>
                `);
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

    // GET /group/:id/category
    static async category(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const group = await CategoryGroup.find(req.params.id);
            if (!group) {
                await BaseController.flashError(req, 'groups', 'Grupo não encontrado');
                return res.redirect('/group');
            }
            const categories = await Category.get();
            // Busca associações existentes
            const items = await CategoryGroupItems.where({ category_group_id: group.id }).get();
            const associated = items.map(i => i.category_id);
            return BaseController.view('categorygroup/category', {
                title: 'Associação de Categorias',
                group,
                categories,
                associated
            }, res, req, 'app');
        } catch (error) {
            CategoryGroupController.log.error('Erro ao carregar associação de categorias', { error: error.message });
            await BaseController.flashError(req, 'groups', 'Erro ao carregar associação');
            return res.redirect('/group');
        }
    }

    // POST /group/:id/category
    static async associateCategory(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.status(401).json({ error: true, message: 'Não autenticado' });
        }
        try {
            const groupId = req.params.id;
            const { category_id, sts } = req.body;
            if (!groupId || !category_id) {
                return res.status(400).json({ error: true, message: 'Dados inválidos' });
            }
            if (sts === 'true' || sts === true) {
                // Ativar: cria se não existir
                const exists = await CategoryGroupItems.where({ category_group_id: groupId, category_id }).first();
                if (!exists) {
                    await CategoryGroupItems.insert({ category_group_id: groupId, category_id });
                }
            } else {
                // Desativar: remove se existir
                await CategoryGroupItems.deleteByGroupAndCategory(groupId, category_id);
            }
            return res.json({ error: false, message: 'Associação atualizada' });
        } catch (error) {
            CategoryGroupController.log.error('Erro ao associar categoria', { error: error.message });
            return res.status(500).json({ error: true, message: 'Erro ao atualizar associação' });
        }
    }
}

module.exports = CategoryGroupController; 