const BaseController = require('./BaseController');
const Event = require('../Models/Event');
const EventValidator = require('../Validations/EventValidator');

class EventController extends BaseController {
    /**
     * Lista todos os eventos
     */
    static async index(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const events = await Event.get();
            return BaseController.view('event/index', {
                title: 'Eventos - FWE',
                events: events
            }, res, req);
        } catch (error) {
            EventController.log.error('Erro ao listar eventos', { error: error.message });
            await BaseController.flashError(req, 'events', 'Erro ao carregar eventos');
            return res.redirect('/dashboard');
        }
    }

    /**
     * Exibe formulário para criar/editar evento
     */
    static async edit(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            let event = null;
            let isEdit = false;

            // Se tem ID, busca o evento para edição
            if (req.params.id) {
                const validation = EventValidator.validateId(req.params.id);
                if (!validation.isValid) {
                    await BaseController.flashError(req, 'events', 'ID inválido');
                    return res.redirect('/event');
                }

                event = await Event.find(req.params.id);
                if (!event) {
                    await BaseController.flashError(req, 'events', 'Evento não encontrado');
                    return res.redirect('/event');
                }
                isEdit = true;
            }

            return BaseController.view('event/edit', {
                title: isEdit ? 'Editar Evento - FWE' : 'Novo Evento - FWE',
                event: event,
                isEdit: isEdit
            }, res, req);
        } catch (error) {
            EventController.log.error('Erro ao carregar formulário de evento', { error: error.message });
            await BaseController.flashError(req, 'events', 'Erro ao carregar formulário');
            return res.redirect('/event');
        }
    }

    /**
     * Cria um novo evento
     */
    static async store(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const validation = EventValidator.validateCreate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'events', 'Dados inválidos');
                return res.redirect('/event/edit');
            }

            const data = req.body;
            data.created_by = sessionData.user.id;
            
            await Event.insert(data);
            
            await BaseController.flashSuccess(req, 'events', 'Evento criado com sucesso!');
            return res.redirect('/event');
        } catch (error) {
            EventController.log.error('Erro ao criar evento', { error: error.message });
            await BaseController.flashError(req, 'events', 'Erro ao criar evento');
            return res.redirect('/event/edit');
        }
    }

    /**
     * Atualiza um evento existente
     */
    static async update(req, res) {
        // Verifica se o usuário está logado
        const sessionData = BaseController.loadSession(req);
        if (!sessionData.user) {
            return res.redirect('/auth');
        }

        try {
            const validation = EventValidator.validateUpdate(req.body);
            if (!validation.isValid) {
                await BaseController.flashError(req, 'events', 'Dados inválidos');
                return res.redirect(`/event/edit/${req.params.id}`);
            }

            const data = req.body;
            await Event.update(req.params.id, data);
            
            await BaseController.flashSuccess(req, 'events', 'Evento atualizado com sucesso!');
            return res.redirect('/event');
        } catch (error) {
            EventController.log.error('Erro ao atualizar evento', { error: error.message });
            await BaseController.flashError(req, 'events', 'Erro ao atualizar evento');
            return res.redirect(`/event/edit/${req.params.id}`);
        }
    }
}

module.exports = EventController; 