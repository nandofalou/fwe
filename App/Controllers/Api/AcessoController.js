const BaseController = require('../BaseController');
const Terminal = require('../../Models/Terminal');
const Ticket = require('../../Models/Ticket');
const TicketAccess = require('../../Models/TicketAccess');
const AccessValidator = require('../../Validations/AccessValidator');
const Response = require('../../Helpers/Response');
const DateHelper = require('../../Helpers/DateHelper');

class AcessoController extends BaseController {

    static async acesso(req, res) {
        const validation = AccessValidator.validateLogin(req.body);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('Dados inválidos', validation.errors));
        }
        try {
            const { pin } = req.body;
            const equipamento = await Terminal.getTerminal().where('terminal.pin', pin).first();
            
            if (!equipamento) {
                return res.status(401).json(Response.access(false,{message: 'Equipamento não encontrado.'}));
            }
            const returnData = {
                "id": equipamento.id,
                "pin": equipamento.pin,
                "nome": equipamento.name,
                "group": {
                    "id": equipamento.category_group_id,
                    "nome_grupo_categoria": equipamento.groupName
                }
            }
            return res.json(Response.access(true, returnData));
        } catch (error) {
            BaseController.log.error('Erro ao logar no terminal', { error: error.message });
            return res.status(500).json(Response.access(false,{message: 'Erro ao logar no terminal.'}));
        }
    }

    static async register(req, res) {
        const validation = AccessValidator.validateLogin(req.body);
        if (!validation.isValid) {
            return res.status(422).json(Response.error('Dados inválidos', validation.errors));
        }
        try {

            const output = {
                action: "CI",
                ticketNumber: null,
                ticketId: null,
                deviceId: null,
                eventId: null,
                eventName: null,
                valid: false,
                photo: null,
                name: null,
                category: null,
                hora_acesso:null,
                proccess: true,
                actionType: {
                    info: "Ticket Inválido",
                    style: "danger"
                }
            }

            const { pin, ticket, viewImage  } = req.body;

            output.ticketNumber = ticket;
            output.hora_acesso = DateHelper.now(true);
            
            // Usar prioridade crítica para validação de terminal
            const equipamento = await Terminal.getTerminal().where('terminal.pin', pin).first();
            
            if (!equipamento) {
                return res.status(401).json(Response.access(false,{message: 'Equipamento não encontrado.'}));
            }

            // Usar prioridade crítica para validação de ticket
            const result = await Ticket.validateTicketQuery(output.hora_acesso)
               .where({
                    'terminal.pin': pin
                })
                .whereRaw("ltrim(ticket.code, '0') = ltrim(?, '0')", [ticket])
                .first();
               
            if(!result) {
                output.action = 'CI'
                output.actionType.info = 'Ticket Inválido'
                output.actionType.style = 'danger'
                
                return res.status(401).json(Response.access(false, output));
            }

            output.ticketId = result.id||null
            output.deviceId = result.terminalId||null
            output.eventId = result.event_id||null
            output.eventName = result.eventName||null
            output.valid = result.eventActive||null
            output.name = result.fullname||null
            output.category = result.categoryName

            if(await AcessoController.validIsMaster(result)) {
                output.action = 'PS'
                output.actionType.info = 'Ticket Liberado'
                output.actionType.style = 'success'
                return res.status(200).json(Response.access(false, output));
            }
    
            if(await AcessoController.validBloqueado(result)) {
                output.action = 'CB'
                output.actionType.info = 'Ticket Bloqueado'
                output.actionType.style = 'danger'
                return res.status(200).json(Response.access(false, output));
            }
    
            if(await AcessoController.invalidEvent(result)) {
                output.action = 'CE'
                output.actionType.info = 'Evento Expirado'
                output.actionType.style = 'danger'
                return res.status(200).json(Response.access(false, output));
            }
    
            if(await AcessoController.validTicket(result)) {
                output.action = 'CB'
                output.actionType.info = 'Ticket Bloqueado'
                output.actionType.style = 'danger'
                return res.status(200).json(Response.access(false, output));
            }
    
            output.action = 'PS'
            output.actionType.info = 'Ticket Liberado'
            output.actionType.style = 'success'

            // Usar prioridade crítica para salvar acesso
            await AcessoController.saveAccess(result, 1)

            return res.json(Response.access(true, output));
        } catch (error) {
            BaseController.log.error('Erro ao logar no terminal', { error: error.message });
            return res.status(500).json(Response.access(false,{message: 'Erro ao logar no terminal.'}, error));
        }
    }

    static async validIsMaster(result) {
        if(result.master == 1 ) {
            // Usar prioridade crítica para salvar acesso
            await AcessoController.saveAccess(result, 1)
            return true;
        }
        return false;
    }

    static async validBloqueado(result) {
        if(result.action == 0 ) {
            // Usar prioridade crítica para salvar acesso
            await this.saveAccess(result, 2)
            return true;
        }
        return false;
    }

    static async invalidEvent(result) {
        if(result.eventActive == 0 ) {
            // Usar prioridade crítica para salvar acesso
            await this.saveAccess(result, 3)
            return true;
        }
        return false;
    }

    static async validTicket(result) {
        if(
            result.multiplo == 0 
            && result.access != 0
            && result.master != 1
        ) {
            // Usar prioridade crítica para salvar acesso
            await this.saveAccess(result, 4)
            return true;
        }
        return false;
    }

    static async saveAccess(result, actId) {
        // Usar prioridade crítica para operações de acesso
        return await TicketAccess.insert({
            ticket_id: result.id,
            event_id: result.event_id,
            terminal_id: result.terminalId,
            code: result.code,
            access_date: DateHelper.now(true), // Data/hora atual no formato SQL
            access_action_id: actId
        }, 'critical');
    }

}

module.exports = AcessoController; 