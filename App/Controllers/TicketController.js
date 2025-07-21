const BaseController = require('./BaseController');
const Ticket = require('../Models/Ticket');
const Event = require('../Models/Event');
const Category = require('../Models/Category');
const Photo = require('../Models/Photo');
const TicketValidator = require('../Validations/TicketValidator');

class TicketController extends BaseController {
    /**
     * Lista todos os tickets (com filtros)
     */
    static async index(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            // Carregar eventos e categorias para os filtros
            const events = await Event.get();
            const categories = await Category.get();
            return BaseController.view('ticket/index', {
                title: 'Cadastro de Tickets',
                events,
                categories,
                filter: { event_id: '', category_id: '', status: '' }
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao carregar tela de tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar tela de tickets');
            return res.redirect('/dashboard');
        }
    }

    /**
     * Endpoint AJAX para DataTables: /ticket/search
     */
    static async search(req, res) {
        try {
            let page = parseInt(req.query.page) || 1;
            let perPage = parseInt(req.query.perPage) || 10;
            let draw = 0;
            let searchValue = '';

            // draw = parseInt(req.query.draw) || 0;
            const builder = Ticket.dataTableQuery();

            if (req.query.start !== undefined && req.query.length !== undefined) {
                
                perPage = parseInt(req.query.length) || 10;
                page = Math.floor((parseInt(req.query.start) || 0) / perPage) + 1;
                draw = parseInt(req.query.draw) || 0;

                builder.limit(perPage, req.query.start);

                if (req.query.search && req.query.search.value) {
                    searchValue = req.query.search.value.trim();
                    builder.like('concat(ticket.code,ticket.fullname,ticket.extrafield1)', searchValue)
                }

                if (req.query.order && req.query.columns) {
                    const colIdx = parseInt(req.query.order[0].column);
                    const colName = req.query.columns[colIdx].data || req.query.columns[colIdx].name;
                    const dir = req.query.order[0].dir && req.query.order[0].dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                    if (colName) {
                        const columnsOrder = [
                            'ticket.id',
                            'ticket.code',
                            'event.name',
                            'category.name',
                            'ticket.active',
                            'ticket.master'
                            
                        ];
                        const orderBy = columnsOrder[colName];
                        builder.orderBy(orderBy, dir);
                    }
                }
            }

            const event_id = req.query.event_id || null;
            const category_id = req.query.category_id || null;
            const status = req.query.status || null;
                
            if(event_id) {
                builder.where({ 'event.id': event_id })
            }

            if(category_id) {
                builder.where({ 'category.id': category_id })
            }

            if(status) {
                builder.where({ 'ticket.active': status })
            }

            // 2. Executa a paginação
            const count = await builder.countQuery("ticket.id", perPage);
            const tickets = await builder.get();
            
            const columns = ['id', 'code', 'eventName', 'active', 'master'];
            
            const data = tickets.map(item => {
                const row = columns.map(col => {
                    if (col === 'eventName') {
                        return `${item.eventName}<br/>${item.categoryName}`;
                    }
                    if (col === 'active') {
                        if(item.active === 1) {
                            return `<span class="badge bg-success">Ativo</span>`
                        } else {
                            return `<span class="badge bg-danger">inativo</span>`
                        }
                    }
                    if (col === 'master') {
                        if(item.master === 1) {
                            return `<span class="badge bg-success">Ativo</span>`
                        } else {
                            return `<span class="badge bg-danger">inativo</span>`
                        }
                    }
                    return item[col];
                });
                row.push(`<div class="btn-group" role="group">
                            <a href="${BaseController.base_url('ticket/edit')}/${item.id}" class="btn btn-sm btn-outline-primary btn-edit">
                                <i class="fi fi-pencil"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-danger js-ajax-confirm" title="Excluir" onclick="confirmDelete(1, 'teste abc')">
                                <i class="fi fi-thrash"></i>
                            </button>
                        </div>`);
                return row;
            });

            // 3. Retorna para a view/API com objeto pager
            return res.json({
                data,
                recordsFiltered: count.rows,
                recordsTotal: count.rows,
                perPage: count.perPage,
                pagination: count.pages
            });
        } catch (error) {
            TicketController.log.error('Erro ao buscar tickets (DataTables)', { error: error.message });
            return res.status(500).json({ error: 'Erro ao buscar tickets' });
        }
    }

    /**
     * Exibe formulário para criar/editar ticket
     */
    static async edit(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            let ticket = null;
            let isEdit = false;
            let photoBase64 = null;
            const events = await Event.get();
            const categories = await Category.get();

            if (req.params.id) {
                const validation = TicketValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'tickets', 'ID inválido');
                    return res.redirect('/ticket');
                }
                ticket = await Ticket.find(req.params.id);
                if (!ticket) {
                    await BaseController.flashError(req, 'tickets', 'Ticket não encontrado');
                    return res.redirect('/ticket');
                }
                isEdit = true;
                // Buscar foto base64 se existir
                const photo = await Photo.where({ ticket_id: ticket.id }).first();
                if (photo && photo.base64) {
                    photoBase64 = photo.base64;
                }
            }

            return BaseController.view('ticket/edit', {
                title: isEdit ? 'Editar Ticket' : 'Novo Ticket',
                ticket,
                isEdit,
                events,
                categories,
                photoBase64
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao carregar formulário de ticket', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar formulário');
            return res.redirect('/ticket');
        }
    }

    /**
     * Cria um novo ticket
     */
    static async store(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = TicketValidator.validateCreate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'tickets', 'Dados inválidos');
                return res.redirect('/ticket/edit');
            }
            const data = req.body;
            await Ticket.insert(data);
            await BaseController.flashSuccess(req, 'tickets', 'Ticket criado com sucesso!');
            return res.redirect('/ticket');
        } catch (error) {
            TicketController.log.error('Erro ao criar ticket', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao criar ticket');
            return res.redirect('/ticket/edit');
        }
    }

    /**
     * Atualiza um ticket existente
     */
    static async update(req, res) {
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }
        try {
            const validation = TicketValidator.validateUpdate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'tickets', 'Dados inválidos');
                return res.redirect(`/ticket/edit/${req.params.id}`);
            }
            const data = req.body;
            await Ticket.update(req.params.id, data);
            await BaseController.flashSuccess(req, 'tickets', 'Ticket atualizado com sucesso!');
            return res.redirect('/ticket');
        } catch (error) {
            TicketController.log.error('Erro ao atualizar ticket', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao atualizar ticket');
            return res.redirect(`/ticket/edit/${req.params.id}`);
        }
    }
}

module.exports = TicketController; 