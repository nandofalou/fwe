const BaseController = require('./BaseController');
const Terminal = require('../Models/Terminal');
const TerminalValidator = require('../Validations/TerminalValidator');
const CategoryGroup = require('../Models/CategoryGroup');

class TerminalController extends BaseController {
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            return BaseController.view('terminal/index', {
                title: 'Equipamentos',
                filter: {}
            }, res, req);
        } catch (error) {
            TerminalController.log.error('Erro ao carregar tela de equipamentos', { error: error.message });
            await BaseController.flashError(req, 'devices', 'Erro ao carregar tela de equipamentos');
            return res.redirect('/dashboard');
        }
    }

    static async search(req, res) {
        try {
            let page = parseInt(req.query.page) || 1;
            let perPage = parseInt(req.query.perPage) || 10;
            let draw = 0;
            let searchValue = '';
            // JOIN com category_group
            const builder = Terminal
                .leftJoin('category_group', 'terminal.category_group_id = category_group.id');
            if (req.query.start !== undefined && req.query.length !== undefined) {
                perPage = parseInt(req.query.length) || 10;
                page = Math.floor((parseInt(req.query.start) || 0) / perPage) + 1;
                draw = parseInt(req.query.draw) || 0;
                builder.limit(perPage, req.query.start);
                if (req.query.search && req.query.search.value) {
                    searchValue = req.query.search.value.trim();
                    builder.like({
                        'terminal.pin': searchValue,
                        'terminal.ip': searchValue,
                        'terminal.model': searchValue,
                        'terminal.name': searchValue,
                        'terminal.plataform': searchValue,
                        'category_group.name': searchValue
                    });
                }
                if (req.query.order && req.query.columns) {
                    const colIdx = parseInt(req.query.order[0].column);
                    const columnsOrder = [
                        'terminal.id',
                        'terminal.pin',
                        'terminal.ip',
                        'terminal.model',
                        'terminal.name',
                        'terminal.plataform',
                        'category_group.name'
                    ];
                    const dir = req.query.order[0].dir && req.query.order[0].dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                    const orderBy = columnsOrder[colIdx] || 'terminal.id';
                    builder.orderBy(orderBy, dir);
                }
            }
            const count = await builder.countQuery('terminal.id', perPage);
            const devices = await builder.select([
                'terminal.id',
                'terminal.pin',
                'terminal.ip',
                'terminal.model',
                'terminal.name',
                'terminal.plataform',
                'category_group.name as categoryGroup'
            ]).get();
            const columns = ['id', 'pin', 'ip', 'model', 'name', 'plataform', 'categoryGroup'];
            const data = devices.map(item => {
                const row = columns.map(col => item[col]);
                row.push(`<div class="btn-group" role="group">
                            <a href="${BaseController.base_url('device/edit')}/${item.id}" class="btn btn-sm btn-outline-primary btn-edit">
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
            TerminalController.log.error('Erro ao buscar equipamentos (DataTables)', { error: error.message });
            return res.status(500).json({ error: 'Erro ao buscar equipamentos' });
        }
    }

    static async edit(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            let device = null;
            let isEdit = false;
            // Buscar todos os grupos para o select
            const categoryGroups = await CategoryGroup.get();
            // Pega os modelos do model Terminal
            const models = (new Terminal()).models;
            if (req.params.id) {
                const validation = TerminalValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'devices', 'ID inválido');
                    return res.redirect('/device');
                }
                device = await Terminal.find(req.params.id);
                if (!device) {
                    await BaseController.flashError(req, 'devices', 'Equipamento não encontrado');
                    return res.redirect('/device');
                }
                isEdit = true;
            }
            return BaseController.view('terminal/edit', {
                title: isEdit ? 'Editar Equipamento' : 'Novo Equipamento',
                device,
                isEdit,
                categoryGroups,
                models
            }, res, req);
        } catch (error) {
            TerminalController.log.error('Erro ao carregar formulário de equipamento', { error: error.message });
            await BaseController.flashError(req, 'devices', 'Erro ao carregar formulário');
            return res.redirect('/device');
        }
    }

    static async store(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = TerminalValidator.validateCreate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'devices', 'Dados inválidos');
                return res.redirect('/device/edit');
            }
            const data = req.body;
            await Terminal.insert(data);
            await BaseController.flashSuccess(req, 'devices', 'Equipamento criado com sucesso!');
            return res.redirect('/device');
        } catch (error) {
            TerminalController.log.error('Erro ao criar equipamento', { error: error.message });
            await BaseController.flashError(req, 'devices', 'Erro ao criar equipamento');
            return res.redirect('/device/edit');
        }
    }

    static async update(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = TerminalValidator.validateUpdate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'devices', 'Dados inválidos');
                return res.redirect(`/device/edit/${req.params.id}`);
            }
            const data = req.body;
            await Terminal.update(req.params.id, data);
            await BaseController.flashSuccess(req, 'devices', 'Equipamento atualizado com sucesso!');
            return res.redirect('/device');
        } catch (error) {
            TerminalController.log.error('Erro ao atualizar equipamento', { error: error.message });
            await BaseController.flashError(req, 'devices', 'Erro ao atualizar equipamento');
            return res.redirect(`/device/edit/${req.params.id}`);
        }
    }
}

module.exports = TerminalController; 