const Event = require('../../Models/Event');
const EventValidator = require('../../Validations/EventValidator');
const Response = require('../../Helpers/Response');
const BaseController = require('../BaseController');

class EventController extends BaseController {
    static async index(req, res) {
        try {
            const events = await Event.get();
            return res.json(Response.success(events));
        } catch (error) {
            EventController.log.error('Erro ao listar eventos', { error: error.message });
            return res.status(500).json(Response.error('Erro ao listar eventos.', null));
        }
    }
    static async show(req, res) {
        try {
            const validation = EventValidator.validateId(req.params.id);
            if (!validation.isValid) {
                return res.status(422).json(Response.error('ID inválido', validation.errors));
            }
            const event = await Event.find(req.params.id);
            if (!event) return res.status(404).json(Response.error('Evento não encontrado.'));
            return res.json(Response.success(event));
        } catch (error) {
            EventController.log.error('Erro ao buscar evento', { error: error.message });
            return res.status(500).json(Response.error('Erro ao buscar evento.', null));
        }
    }
    static async store(req, res) {
        const validation = EventValidator.validateCreate(req.body);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('Dados inválidos', validation.errors));
        }
        try {
            const data = req.body;
            data.created_by = req.user.id;
            const id = await Event.insert(data);
            return res.status(201).json(Response.success({ id }, 'Evento criado com sucesso.'));
        } catch (error) {
            EventController.log.error('Erro ao criar evento', { error: error.message });
            return res.status(500).json(Response.error('Erro ao criar evento.', null));
        }
    }
    static async update(req, res) {
        const validation = EventValidator.validateUpdate(req.body);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('Dados inválidos', validation.errors));
        }
        try {
            const data = req.body;
            await Event.update(req.params.id, data);
            return res.json(Response.success(null, 'Evento atualizado com sucesso.'));
        } catch (error) {
            EventController.log.error('Erro ao atualizar evento', { error: error.message });
            return res.status(500).json(Response.error('Erro ao atualizar evento.', null));
        }
    }
    static async destroy(req, res) {
        try {
            await Event.delete(req.params.id);
            return res.json(Response.success(null, 'Evento removido com sucesso.'));
        } catch (error) {
            EventController.log.error('Erro ao remover evento', { error: error.message });
            return res.status(500).json(Response.error('Erro ao remover evento.', null));
        }
    }
}

module.exports = EventController; 