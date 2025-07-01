const Event = require('../Models/Event');
const Validator = require('../Helpers/Validator');

const EventController = {
    async index(req, res) {
        try {
            const events = await Event.get();
            return res.json(events);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao listar eventos.', error: error.message });
        }
    },
    async show(req, res) {
        try {
            const event = await Event.find(req.params.id);
            if (!event) return res.status(404).json({ message: 'Evento não encontrado.' });
            return res.json(event);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar evento.', error: error.message });
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
            return res.status(422).json({ errors });
        }
        try {
            const data = req.body;
            data.created_by = req.user.id;
            const id = await Event.insert(data);
            return res.status(201).json({ id });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar evento.', error: error.message });
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
            return res.status(422).json({ errors });
        }
        try {
            const data = req.body;
            await Event.update(req.params.id, data);
            return res.json({ message: 'Evento atualizado com sucesso.' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar evento.', error: error.message });
        }
    },
    async destroy(req, res) {
        try {
            // Deleção lógica: marca deleted_at
            await Event.update(req.params.id, { deleted_at: new Date() });
            return res.json({ message: 'Evento removido com sucesso.' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao remover evento.', error: error.message });
        }
    }
};

module.exports = EventController; 