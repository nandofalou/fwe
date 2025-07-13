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
            // Filtros
            const event_id = req.query.event_id || '';
            const category_id = req.query.category_id || '';
            const status = req.query.status || '';

            // Carregar eventos e categorias para os filtros
            const events = await Event.get();
            const categories = await Category.get();

            // Montar query de tickets
            let tickets = await Ticket.get();
            if (event_id) tickets = tickets.filter(t => t.event_id == event_id);
            if (category_id) tickets = tickets.filter(t => t.category_id == category_id);
            if (status !== '') tickets = tickets.filter(t => String(t.active) === String(status));

            return BaseController.view('ticket/index', {
                title: 'Cadastro de Tickets',
                tickets,
                events,
                categories,
                filter: { event_id, category_id, status }
            }, res, req);
        } catch (error) {
            TicketController.log.error('Erro ao listar tickets', { error: error.message });
            await BaseController.flashError(req, 'tickets', 'Erro ao carregar tickets');
            return res.redirect('/dashboard');
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