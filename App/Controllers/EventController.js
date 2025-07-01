const Event = require('../Models/Event');
const Validator = require('../Helpers/Validator');
const Response = require('../Helpers/Response');

const EventController = {
    async index(req, res) {
        try {
            const events = await Event.get();
            return res.json(Response.success(events));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao listar eventos.', null));
        }
    },
    async show(req, res) {
        try {
            const event = await Event.find(req.params.id);
            if (!event) return res.status(404).json(Response.error('Evento não encontrado.'));
            return res.json(Response.success(event));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao buscar evento.', null));
        }
    },
    async store(req, res) {
        const rules = {
            name: 'required',
            startdate: 'required|date',
            enddate: 'required|date',
            active: 'required|numeric'
        };
        const { isValid, errors } = Validator.validate(req.body, rules);
        if (!isValid) {
            return res.status(422).json(Response.error('Dados inválidos', errors));
        }
        try {
            const data = req.body;
            data.created_by = req.user.id;
            const id = await Event.insert(data);
            return res.status(201).json(Response.success({ id }, 'Evento criado com sucesso.'));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao criar evento.', null));
        }
    },
    async update(req, res) {
        const rules = {
            name: 'required',
            startdate: 'required|date',
            enddate: 'required|date',
            active: 'required|numeric'
        };
        const { isValid, errors } = Validator.validate(req.body, rules);
        if (!isValid) {
            return res.status(422).json(Response.error('Dados inválidos', errors));
        }
        try {
            const data = req.body;
            await Event.update(req.params.id, data);
            return res.json(Response.success(null, 'Evento atualizado com sucesso.'));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao atualizar evento.', null));
        }
    },
    async destroy(req, res) {
        try {
            await Event.delete(req.params.id);
            return res.json(Response.success(null, 'Evento removido com sucesso.'));
        } catch (error) {
            return res.status(500).json(Response.error('Erro ao remover evento.', null));
        }
    }
};

module.exports = EventController; 